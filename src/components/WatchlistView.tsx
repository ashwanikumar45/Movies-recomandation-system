import React, { useState } from 'react';
import { WatchlistItem, Movie } from '../types.ts';
import { Bookmark, CheckCircle2, Circle, Trash2, Play, Film } from 'lucide-react';
import { MoviePoster } from './MoviePoster.tsx';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onToggleWatched: (movieId: string, watched: boolean) => void;
  onRemove: (movieId: string) => void;
  onOpenDetails: (movie: Movie) => void;
  onGoToRecommendations: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onToggleWatched,
  onRemove,
  onOpenDetails,
  onGoToRecommendations,
}) => {
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');

  const filtered = watchlist.filter((item) => {
    if (filter === 'watched') return item.watched;
    if (filter === 'unwatched') return !item.watched;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <span>Curated Watchlist</span>
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              {watchlist.length} titles
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Films saved to your testing persona's personal queue. Adding items trains the content recommender.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-850">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({watchlist.length})
          </button>
          <button
            onClick={() => setFilter('unwatched')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'unwatched'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unwatched ({watchlist.filter((w) => !w.watched).length})
          </button>
          <button
            onClick={() => setFilter('watched')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === 'watched'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watched ({watchlist.filter((w) => w.watched).length})
          </button>
        </div>
      </div>

      {/* List or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center mx-auto text-slate-500">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {filter === 'all'
                ? 'Your watchlist is empty'
                : `No ${filter} titles in your watchlist`}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Browse hybrid algorithmic recommendations and click the bookmark button to save films for later.
            </p>
          </div>
          <button
            onClick={onGoToRecommendations}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Explore Recommendations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const movie = item.movie;
            if (!movie) return null;

            return (
              <div
                key={item.id}
                className={`relative flex gap-4 p-4 rounded-xl border transition-all ${
                  item.watched
                    ? 'bg-slate-950/60 border-slate-850 opacity-80'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Poster */}
                <div
                  onClick={() => onOpenDetails(movie)}
                  className="w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-slate-950 cursor-pointer relative group"
                >
                  <MoviePoster
                    src={movie.posterPath}
                    alt={movie.title}
                    title={movie.title}
                    year={movie.releaseYear || movie.releaseDate?.split('-')[0]}
                    genres={movie.genres}
                    className="group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[11px] text-slate-400">
                        {movie.releaseYear || movie.releaseDate.split('-')[0]} · {movie.runtime || 120}m
                      </div>
                      <button
                        onClick={() => onRemove(movie.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      onClick={() => onOpenDetails(movie)}
                      className={`text-sm font-bold truncate cursor-pointer hover:text-amber-400 transition-colors ${
                        item.watched ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {movie.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {movie.genres.slice(0, 2).join(', ')}
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-amber-400/90 italic truncate mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Mark as Watched Toggle */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onToggleWatched(movie.id, !item.watched)}
                      className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        item.watched
                          ? 'text-emerald-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.watched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                          <span>Watched</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>Mark Watched</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenDetails(movie)}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Trailer ↗
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
