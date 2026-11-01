import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';
import { Movie, User, Interaction, RecommendationResult, RecommenderWeights, MLProfileStats } from './types.ts';

// Server-side Gemini initialization as mandated by gemini-api skill
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export class MLRecommenderService {
  // 1. CONTENT-BASED FILTERING: Build genre & thematic vector for a movie
  public getMovieVector(movie: Movie): Record<string, number> {
    const vector: Record<string, number> = {};

    // Genre weights
    movie.genres.forEach(g => {
      vector[`genre_${g.toLowerCase()}`] = 1.0;
    });

    // Director weight
    if (movie.director) {
      vector[`dir_${movie.director.toLowerCase().replace(/\s+/g, '_')}`] = 1.2;
    }

    // Keyword weights
    if (movie.keywords) {
      movie.keywords.forEach(k => {
        vector[`kw_${k.toLowerCase().replace(/\s+/g, '_')}`] = 0.8;
      });
    }

    return vector;
  }

  // Build the user's dynamic taste vector from interactions and watchlist
  public getUserTasteVector(userId: string): Record<string, number> {
    const user = db.getUser(userId);
    const interactions = db.getInteractions(userId);
    const watchlist = db.getWatchlist(userId);

    const tasteVector: Record<string, number> = {};

    // Incorporate user's explicit base favorite/disliked genres
    if (user?.favoriteGenres) {
      user.favoriteGenres.forEach(g => {
        tasteVector[`genre_${g.toLowerCase()}`] = (tasteVector[`genre_${g.toLowerCase()}`] || 0) + 2.0;
      });
    }
    if (user?.dislikedGenres) {
      user.dislikedGenres.forEach(g => {
        tasteVector[`genre_${g.toLowerCase()}`] = (tasteVector[`genre_${g.toLowerCase()}`] || 0) - 2.5;
      });
    }

    // Incorporate interactions with mathematical weights
    interactions.forEach(interaction => {
      const movie = db.getMovie(interaction.movieId);
      if (!movie) return;

      let multiplier = 0;
      switch (interaction.type) {
        case 'superlike':
          multiplier = 3.5;
          break;
        case 'like':
          multiplier = 2.0;
          break;
        case 'dislike':
          multiplier = -3.0;
          break;
        case 'rate':
          multiplier = ((interaction.rating || 5) - 5) * 0.8; // range roughly -3.2 to +4.0
          break;
      }

      const movieVec = this.getMovieVector(movie);
      for (const [feature, weight] of Object.entries(movieVec)) {
        tasteVector[feature] = (tasteVector[feature] || 0) + weight * multiplier;
      }
    });

    // Incorporate watchlist items (positive intent)
    watchlist.forEach(item => {
      if (item.movie) {
        const movieVec = this.getMovieVector(item.movie);
        for (const [feature, weight] of Object.entries(movieVec)) {
          tasteVector[feature] = (tasteVector[feature] || 0) + weight * 1.2;
        }
      }
    });

    return tasteVector;
  }

  // Cosine Similarity between two sparse vectors
  public cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [key, valA] of Object.entries(vecA)) {
      normA += valA * valA;
      if (vecB[key] !== undefined) {
        dotProduct += valA * vecB[key];
      }
    }

    for (const valB of Object.values(vecB)) {
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    // Normalize from [-1, 1] to [0, 1]
    return Math.max(0, Math.min(1, (similarity + 1) / 2));
  }

  // 2. COLLABORATIVE FILTERING: User-to-User similarity and peer rating prediction
  public computeUserSimilarity(userId1: string, userId2: string): number {
    const int1 = db.getInteractions(userId1);
    const int2 = db.getInteractions(userId2);

    // Build movie score map
    const map1: Record<string, number> = {};
    const map2: Record<string, number> = {};

    const scoreInteraction = (i: Interaction) => {
      if (i.rating !== undefined) return i.rating;
      if (i.type === 'superlike') return 10;
      if (i.type === 'like') return 8;
      if (i.type === 'dislike') return 2;
      return 5;
    };

    int1.forEach(i => (map1[i.movieId] = scoreInteraction(i)));
    int2.forEach(i => (map2[i.movieId] = scoreInteraction(i)));

    const commonMovies = Object.keys(map1).filter(m => map2[m] !== undefined);
    if (commonMovies.length === 0) {
      // Fallback to genre vector similarity if no direct film overlap
      const taste1 = this.getUserTasteVector(userId1);
      const taste2 = this.getUserTasteVector(userId2);
      return this.cosineSimilarity(taste1, taste2);
    }

    let dot = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    commonMovies.forEach(mId => {
      const v1 = map1[mId] - 5.5; // mean centered
      const v2 = map2[mId] - 5.5;
      dot += v1 * v2;
      sumSq1 += v1 * v1;
      sumSq2 += v2 * v2;
    });

    if (sumSq1 === 0 || sumSq2 === 0) return 0.5;
    const corr = dot / (Math.sqrt(sumSq1) * Math.sqrt(sumSq2));
    return Math.max(0, Math.min(1, (corr + 1) / 2));
  }

  // Predict collaborative score for a movie using K-Nearest Neighbors
  public computeCollaborativeScore(userId: string, movie: Movie): { score: number; basisUser?: string } {
    const allUsers = db.getUsers().filter(u => u.id !== userId);
    let weightedScoreSum = 0;
    let simSum = 0;
    let topBasisUser: string | undefined;
    let maxWeight = 0;

    for (const otherUser of allUsers) {
      const sim = this.computeUserSimilarity(userId, otherUser.id);
      const otherInteraction = db.getMovieInteraction(otherUser.id, movie.id);

      if (otherInteraction && sim > 0.1) {
        let numericRating = 7;
        if (otherInteraction.rating) numericRating = otherInteraction.rating;
        else if (otherInteraction.type === 'superlike') numericRating = 10;
        else if (otherInteraction.type === 'like') numericRating = 8.5;
        else if (otherInteraction.type === 'dislike') numericRating = 2.0;

        const effectiveWeight = sim * (otherInteraction.type === 'dislike' ? 1.5 : 1.0);
        weightedScoreSum += numericRating * effectiveWeight;
        simSum += effectiveWeight;

        if (effectiveWeight > maxWeight) {
          maxWeight = effectiveWeight;
          topBasisUser = otherUser.name;
        }
      }
    }

    if (simSum === 0) {
      // If no neighbors interacted with this movie yet, use community vote average as prior
      return { score: (movie.voteAverage || 7.5) / 10, basisUser: undefined };
    }

    const predicted = weightedScoreSum / simSum; // out of 10
    return { score: Math.max(0, Math.min(1, predicted / 10)), basisUser: topBasisUser };
  }

  private explanationCache: Map<string, string> = new Map();

  // 3. AI SEMANTIC REASONING: Gemini-powered deep cinematic rationale
  public async getGeminiExplanation(user: User, movie: Movie, likedTitles: string[]): Promise<string | null> {
    const cacheKey = `${user.id}_${movie.id}`;
    if (this.explanationCache.has(cacheKey)) {
      return this.explanationCache.get(cacheKey)!;
    }

    if (!ai) return null;

    try {
      const prompt = `As a master cinema curator and machine learning film recommender, provide a sharp, compelling 1-2 sentence explanation of why the movie "${movie.title}" (${movie.releaseYear}, directed by ${movie.director || 'Various'}, genres: ${movie.genres.join(', ')}) is recommended for a film enthusiast who loves: ${likedTitles.slice(0, 4).join(', ')}. Focus on thematic resonance, cinematic tone, and pacing. Keep it under 40 words.`;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const aiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }).then(res => {
        const text = res.text?.trim() || null;
        if (text) {
          this.explanationCache.set(cacheKey, text);
        }
        return text;
      }).catch(() => null);

      return await Promise.race([aiCall, timeoutPromise]);
    } catch (err) {
      console.warn('Gemini explanation call failed, using heuristic rationale:', err);
      return null;
    }
  }

  // 4. HYBRID RECOMMENDATION GENERATION
  public async getRecommendations(userId: string, limit: number = 12): Promise<RecommendationResult[]> {
    const user = db.getUser(userId);
    if (!user) return [];

    const weights = db.getWeights(userId);
    const allMovies = db.getMovies();
    const interactions = db.getInteractions(userId);
    const tasteVector = this.getUserTasteVector(userId);

    const interactedMovieIds = new Set(interactions.map(i => i.movieId));
    const dislikedMovieIds = new Set(
      interactions.filter(i => i.type === 'dislike' || (i.rating && i.rating < 5)).map(i => i.movieId)
    );
    const likedMovieTitles = interactions
      .filter(i => i.type === 'like' || i.type === 'superlike' || (i.rating && i.rating >= 7))
      .map(i => db.getMovie(i.movieId)?.title)
      .filter(Boolean) as string[];

    const results: RecommendationResult[] = [];

    for (const movie of allMovies) {
      // Disliked movies should not be recommended
      if (dislikedMovieIds.has(movie.id)) continue;

      // Content-Based Score
      const movieVec = this.getMovieVector(movie);
      const contentSim = this.cosineSimilarity(tasteVector, movieVec);
      const contentScore = Math.round(contentSim * 100);

      // Collaborative Filtering Score
      const { score: collabNorm, basisUser } = this.computeCollaborativeScore(userId, movie);
      const collabScore = Math.round(collabNorm * 100);

      // Semantic / Thematic Score
      let semanticScore = contentScore;
      // Bonus if director or keywords align
      if (movie.director && tasteVector[`dir_${movie.director.toLowerCase().replace(/\s+/g, '_')}`] > 0) {
        semanticScore = Math.min(100, semanticScore + 12);
      }
      const genreOverlap = movie.genres.filter(g => user.favoriteGenres.includes(g));
      if (genreOverlap.length >= 2) {
        semanticScore = Math.min(100, semanticScore + 8);
      }

      // Hybrid Weighted Fusion
      const totalWeight = weights.contentWeight + weights.collabWeight + weights.semanticWeight;
      const wContent = weights.contentWeight / totalWeight;
      const wCollab = weights.collabWeight / totalWeight;
      const wSemantic = weights.semanticWeight / totalWeight;

      let hybridScoreRaw = (contentScore * wContent) + (collabScore * wCollab) + (semanticScore * wSemantic);

      // Slight freshness / popularity modifier
      if (movie.voteAverage && movie.voteAverage >= 8.0) {
        hybridScoreRaw = Math.min(100, hybridScoreRaw + 2);
      }

      // If user already interacted (liked or superliked), slight penalty in recommendation queue so fresh films surface
      if (interactedMovieIds.has(movie.id)) {
        hybridScoreRaw -= 15;
      }

      const hybridScore = Math.max(10, Math.min(99, Math.round(hybridScoreRaw)));

      // Generate explainable contributing reasons
      const reasons: string[] = [];
      if (genreOverlap.length > 0) {
        reasons.push(`Genre match: ${genreOverlap.join(' & ')}`);
      }
      if (movie.director && tasteVector[`dir_${movie.director.toLowerCase().replace(/\s+/g, '_')}`] > 0) {
        reasons.push(`Auteur synergy: ${movie.director}`);
      }
      if (basisUser) {
        reasons.push(`Co-affinity with ${basisUser}'s taste profile`);
      }
      if (movie.voteAverage >= 8.0) {
        reasons.push(`Universal acclaim (${movie.voteAverage}/10 rating)`);
      }
      if (reasons.length === 0) {
        reasons.push(`Thematic resonance with your cinema watch profile`);
      }

      // Heuristic default explanation
      let explanation = `Top hybrid pick: ${hybridScore}% match based on your affinity for ${genreOverlap.slice(0, 2).join(' and ') || 'similar cinematic aesthetics'}.`;

      results.push({
        movie,
        hybridScore,
        contentScore,
        collaborativeScore: collabScore,
        semanticScore,
        explanation,
        reasons,
        matchingGenres: genreOverlap,
        userSimilarityBasis: basisUser,
      });
    }

    // Sort descending by hybrid score
    results.sort((a, b) => b.hybridScore - a.hybridScore);

    const topResults = results.slice(0, limit);

    // If Gemini is configured, enhance the top 3 recommendations with AI reasoning
    if (ai && topResults.length > 0) {
      try {
        const top3 = topResults.slice(0, 3);
        await Promise.all(
          top3.map(async r => {
            const aiReason = await this.getGeminiExplanation(user, r.movie, likedMovieTitles);
            if (aiReason) {
              r.explanation = aiReason;
            }
          })
        );
      } catch (e) {
        // Fallback maintained
      }
    }

    return topResults;
  }

  // Get deep ML stats and profile metrics for UI transparency
  public getProfileMLStats(userId: string): MLProfileStats | null {
    const user = db.getUser(userId);
    if (!user) return null;

    const interactions = db.getInteractions(userId);
    const watchlist = db.getWatchlist(userId);
    const tasteVector = this.getUserTasteVector(userId);
    const weights = db.getWeights(userId);

    const totalLikes = interactions.filter(i => i.type === 'like').length;
    const totalSuperlikes = interactions.filter(i => i.type === 'superlike').length;
    const totalDislikes = interactions.filter(i => i.type === 'dislike').length;
    const totalRatings = interactions.filter(i => i.type === 'rate').length;
    const totalWatchlist = watchlist.length;

    // Genre distribution
    const genreScores: Record<string, { score: number; count: number }> = {};
    for (const [key, val] of Object.entries(tasteVector)) {
      if (key.startsWith('genre_')) {
        const genre = key.replace('genre_', '');
        const capitalized = genre.charAt(0).toUpperCase() + genre.slice(1);
        genreScores[capitalized] = {
          score: Math.round(val * 10) / 10,
          count: 1,
        };
      }
    }

    const topGenres = Object.entries(genreScores)
      .map(([genre, data]) => ({ genre, score: data.score, count: data.count }))
      .sort((a, b) => b.score - a.score);

    // Peer similarities
    const allUsers = db.getUsers().filter(u => u.id !== userId);
    const userSimilarities = allUsers.map(other => ({
      otherUserId: other.id,
      otherUserName: other.name,
      similarity: Math.round(this.computeUserSimilarity(userId, other.id) * 100),
    })).sort((a, b) => b.similarity - a.similarity);

    return {
      userId,
      totalLikes,
      totalSuperlikes,
      totalDislikes,
      totalRatings,
      totalWatchlist,
      topGenres,
      tasteVector,
      userSimilarities,
      activeWeights: weights,
    };
  }
}

export const recommender = new MLRecommenderService();
