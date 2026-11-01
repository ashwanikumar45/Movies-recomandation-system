import React, { useState, useEffect } from 'react';
import { Search, Loader2, Compass } from 'lucide-react';
import { Movie, Interaction } from '../types.ts';
import { MovieCard } from './MovieCard.tsx';
import { api } from '../api.ts';

interface DiscoverViewProps {
  onOpenDetails: (movie: Movie) => void;
  onLike: (movieId: string) => void;
  onDislike: (movieId: string) => void;
  onToggleWatchlist: (movieId: string) => void;
  watchlistMovieIds: Set<string>;
  interactionsMap: Map<string, Interaction>;
}

const POPULAR_GENRES = [
  'All',
  'Bollywood',
  'South (Hindi Dubbed)',
  'Action',
  'Thriller',
  'Drama',
  'Crime',
  'Romance',
  'Comedy',
  'Science Fiction',
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onOpenDetails,
  onLike,
  onDislike,
  onToggleWatchlist,
  watchlistMovieIds,
  interactionsMap,
}) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Search or fetch trending
  useEffect(() => {
    let isCurrent = true;
    const fetchMovies = async () => {
      setLoading(true);
      try {
        if (query.trim()) {
          const results = await api.searchMovies(query);
          if (isCurrent) setMovies(results);
        } else {
          const trending = await api.getTrendingMovies();
          if (isCurrent) setMovies(trending);
        }
      } catch (err) {
        console.error('Error fetching discover movies:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(debounceTimer);
    };
  }, [query]);

  // Filter by selected genre
  const filteredMovies = movies.filter((m) => {
    if (selectedGenre === 'All') return true;
    return m.genres.some(
      (g) => g.toLowerCase() === selectedGenre.toLowerCase()
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & TMDB Source Attribution */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white font-display">Search & Discover Films</h2>
          <p className="text-xs text-slate-400">
            Movie metadata, synopses, and posters are sourced directly from TMDB (The Movie Database).
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0">
          <span>TMDB API Verified</span>
        </div>
      </div>

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search TMDB titles, directors, actors..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        {/* Genre Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          <p className="text-xs">Querying dynamic TMDB catalog...</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8">
          <Compass className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No movies found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for another title, director, or adjust genre filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenDetails={(m) => onOpenDetails(m)}
              onLike={onLike}
              onDislike={onDislike}
              onToggleWatchlist={onToggleWatchlist}
              inWatchlist={watchlistMovieIds.has(movie.id)}
              interaction={interactionsMap.get(movie.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
