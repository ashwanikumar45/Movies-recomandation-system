import { User, Movie, Interaction, WatchlistItem, RecommendationResult, RecommenderWeights, MLProfileStats } from './types.ts';

const BASE_URL = '/api';

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to create user');
    const data = await res.json();
    return data.user;
  },

  // Recommendations
  async getRecommendations(userId: string, limit: number = 12): Promise<{ recommendations: RecommendationResult[]; weights: RecommenderWeights }> {
    const res = await fetch(`${BASE_URL}/recommendations/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async tuneWeights(userId: string, weights: RecommenderWeights): Promise<{ recommendations: RecommendationResult[]; weights: RecommenderWeights }> {
    const res = await fetch(`${BASE_URL}/recommendations/${userId}/tune`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    if (!res.ok) throw new Error('Failed to tune weights');
    return res.json();
  },

  // Interactions (Like, Dislike, Rate, Superlike)
  async getInteractions(userId: string): Promise<Interaction[]> {
    const res = await fetch(`${BASE_URL}/interactions/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch interactions');
    const data = await res.json();
    return data.interactions;
  },

  async recordInteraction(userId: string, movieId: string, type: 'like' | 'superlike' | 'dislike' | 'rate', rating?: number): Promise<{ interaction: Interaction; stats: MLProfileStats }> {
    const res = await fetch(`${BASE_URL}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, movieId, type, rating }),
    });
    if (!res.ok) throw new Error('Failed to record interaction');
    return res.json();
  },

  async removeInteraction(userId: string, movieId: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/interactions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, movieId }),
    });
    if (!res.ok) throw new Error('Failed to remove interaction');
    const data = await res.json();
    return data.success;
  },

  // Watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const res = await fetch(`${BASE_URL}/watchlist/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    const data = await res.json();
    return data.watchlist;
  },

  async toggleWatchlist(userId: string, movieId: string, notes?: string): Promise<{ inWatchlist: boolean; item?: WatchlistItem }> {
    const res = await fetch(`${BASE_URL}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, movieId, notes }),
    });
    if (!res.ok) throw new Error('Failed to toggle watchlist');
    return res.json();
  },

  async setWatchedStatus(userId: string, movieId: string, watched: boolean): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/watchlist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, movieId, watched }),
    });
    if (!res.ok) throw new Error('Failed to update watch status');
    const data = await res.json();
    return data.success;
  },

  // Movies & Search
  async searchMovies(query: string): Promise<Movie[]> {
    const res = await fetch(`${BASE_URL}/movies/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.movies;
  },

  async getTrendingMovies(): Promise<Movie[]> {
    const res = await fetch(`${BASE_URL}/movies/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    const data = await res.json();
    return data.movies;
  },

  async getMovieDetails(id: string): Promise<Movie> {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    if (!res.ok) throw new Error('Failed to fetch movie details');
    const data = await res.json();
    return data.movie;
  },

  // ML Stats
  async getMLStats(userId: string): Promise<MLProfileStats> {
    const res = await fetch(`${BASE_URL}/stats/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch ML stats');
    const data = await res.json();
    return data.stats;
  },

  // Reset database to defaults
  async resetDatabase(): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
    return true;
  },
};
