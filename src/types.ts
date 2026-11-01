export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  overview: string;
  genres: string[];
  releaseDate: string;
  releaseYear?: number;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  voteCount: number;
  runtime?: number;
  director?: string;
  cast?: string[];
  keywords?: string[];
  trailerKey?: string;
  popularity?: number;
}

export interface User {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  favoriteGenres: string[];
  dislikedGenres: string[];
  aesthetic: string;
  primaryColor: string;
}

export type InteractionType = 'like' | 'superlike' | 'dislike' | 'rate';

export interface Interaction {
  id: string;
  userId: string;
  movieId: string;
  type: InteractionType;
  rating?: number;
  timestamp: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  watched: boolean;
  notes?: string;
  addedAt: string;
  movie?: Movie;
}

export interface RecommenderWeights {
  contentWeight: number;
  collabWeight: number;
  semanticWeight: number;
}

export interface RecommendationResult {
  movie: Movie;
  hybridScore: number;
  contentScore: number;
  collaborativeScore: number;
  semanticScore: number;
  explanation: string;
  reasons: string[];
  matchingGenres: string[];
  userSimilarityBasis?: string;
}

export interface MLProfileStats {
  userId: string;
  totalLikes: number;
  totalSuperlikes: number;
  totalDislikes: number;
  totalRatings: number;
  totalWatchlist: number;
  topGenres: { genre: string; score: number; count: number }[];
  tasteVector: Record<string, number>;
  userSimilarities: { otherUserId: string; otherUserName: string; similarity: number }[];
  activeWeights: RecommenderWeights;
}
