import { Movie } from './types.ts';
import { db } from './db.ts';

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Genre ID to name mapping for TMDB
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export class TMDBService {
  private hasApiKey(): boolean {
    return Boolean(TMDB_API_KEY && TMDB_API_KEY.length > 5);
  }

  // Normalize a raw TMDB result into our application's Movie interface
  public normalizeMovie(raw: any, detailedData?: any): Movie {
    const poster = raw.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${raw.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; // fallback placeholder
    const backdrop = raw.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w1280${raw.backdrop_path}`
      : poster;

    const genres: string[] = [];
    if (detailedData?.genres && Array.isArray(detailedData.genres)) {
      genres.push(...detailedData.genres.map((g: any) => g.name));
    } else if (raw.genre_ids && Array.isArray(raw.genre_ids)) {
      raw.genre_ids.forEach((id: number) => {
        if (GENRE_MAP[id]) genres.push(GENRE_MAP[id]);
      });
    }

    // Extract director and cast from credits if available
    let director = 'Acclaimed Filmmaker';
    const cast: string[] = [];
    if (detailedData?.credits) {
      const crew = detailedData.credits.crew || [];
      const dirObj = crew.find((c: any) => c.job === 'Director');
      if (dirObj) director = dirObj.name;

      const castList = detailedData.credits.cast || [];
      castList.slice(0, 5).forEach((c: any) => cast.push(c.name));
    }

    // Extract official trailer from videos
    let trailerKey: string | undefined;
    if (detailedData?.videos?.results && Array.isArray(detailedData.videos.results)) {
      const trailer = detailedData.videos.results.find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      if (trailer) trailerKey = trailer.key;
    }

    // Extract keywords
    const keywords: string[] = [];
    if (detailedData?.keywords?.keywords && Array.isArray(detailedData.keywords.keywords)) {
      keywords.push(...detailedData.keywords.keywords.map((k: any) => k.name).slice(0, 8));
    }

    const releaseDate = raw.release_date || '2024-01-01';
    const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : 2024;

    return {
      id: `tmdb_${raw.id}`,
      tmdbId: raw.id,
      title: raw.title || raw.name || 'Untitled Film',
      originalTitle: raw.original_title,
      overview: raw.overview || 'No synopsis available for this title.',
      genres: genres.length > 0 ? genres : ['Drama'],
      releaseDate,
      releaseYear,
      posterPath: poster,
      backdropPath: backdrop,
      voteAverage: Number((raw.vote_average || 7.0).toFixed(1)),
      voteCount: raw.vote_count || 100,
      runtime: detailedData?.runtime || 120,
      director,
      cast: cast.length > 0 ? cast : ['Leading Cast'],
      keywords: keywords.length > 0 ? keywords : genres.map(g => g.toLowerCase()),
      trailerKey,
      popularity: raw.popularity || 50,
    };
  }

  // Dynamic Search
  public async searchMovies(query: string): Promise<Movie[]> {
    if (!query || query.trim().length === 0) {
      return db.getMovies().slice(0, 12);
    }

    // 1. Try Live TMDB API if key is available
    if (this.hasApiKey()) {
      try {
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const movies: Movie[] = data.results.slice(0, 10).map((raw: any) => {
              const movie = this.normalizeMovie(raw);
              db.upsertMovie(movie); // dynamically cache in DB
              return movie;
            });
            return movies;
          }
        }
      } catch (err) {
        console.warn('TMDB API search failed, falling back to database query:', err);
      }
    }

    // 2. Query dynamic database
    const q = query.toLowerCase();
    const existing = db.getMovies().filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.director?.toLowerCase().includes(q) ||
      m.genres.some(g => g.toLowerCase().includes(q)) ||
      m.keywords?.some(k => k.toLowerCase().includes(q)) ||
      m.cast?.some(c => c.toLowerCase().includes(q))
    );

    return existing;
  }

  // Dynamic Trending / Popular Movies
  public async getTrendingMovies(): Promise<Movie[]> {
    if (this.hasApiKey()) {
      try {
        const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            return data.results.slice(0, 14).map((raw: any) => {
              const movie = this.normalizeMovie(raw);
              db.upsertMovie(movie);
              return movie;
            });
          }
        }
      } catch (err) {
        console.warn('TMDB trending call failed, using internal catalog:', err);
      }
    }

    return db.getMovies().sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Get full movie details with trailers and credits
  public async getMovieDetails(id: string | number): Promise<Movie | undefined> {
    const existing = db.getMovie(String(id));

    // If existing and already has director & trailerKey, return it
    if (existing && existing.director && existing.trailerKey) {
      return existing;
    }

    const tmdbId = existing?.tmdbId || (typeof id === 'number' ? id : parseInt(id.replace('tmdb_', ''), 10));

    if (tmdbId && !isNaN(tmdbId) && this.hasApiKey()) {
      try {
        const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,keywords,similar`;
        const res = await fetch(url);
        if (res.ok) {
          const detailedData = await res.json();
          const normalized = this.normalizeMovie(detailedData, detailedData);
          db.upsertMovie(normalized);
          return normalized;
        }
      } catch (err) {
        console.warn(`TMDB details call failed for ${tmdbId}:`, err);
      }
    }

    return existing;
  }
}

export const tmdb = new TMDBService();
