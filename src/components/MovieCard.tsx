import React from 'react';
import { Bookmark, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { RecommendationResult, Movie, Interaction } from '../types.ts';

import { MoviePoster } from './MoviePoster.tsx';

interface MovieCardProps {
  result?: RecommendationResult;
  movie?: Movie;
  onOpenDetails: (movie: Movie, result?: RecommendationResult) => void;
  onLike: (movieId: string) => void;
  onDislike: (movieId: string) => void;
  onToggleWatchlist: (movieId: string) => void;
  inWatchlist: boolean;
  interaction?: Interaction;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  result,
  movie: rawMovie,
  onOpenDetails,
  onLike,
  onDislike,
  onToggleWatchlist,
  inWatchlist,
  interaction,
}) => {
  const movie = result?.movie || rawMovie;
  if (!movie) return null;

  const hybridScore = result?.hybridScore;
  const isLiked = interaction?.type === 'like' || interaction?.type === 'superlike';
  const isDisliked = interaction?.type === 'dislike';

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200">
      {/* Poster area */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 cursor-pointer"
        onClick={() => onOpenDetails(movie, result)}
      >
        <MoviePoster
          src={movie.posterPath}
          alt={movie.title}
          title={movie.title}
          year={movie.releaseYear || movie.releaseDate?.split('-')[0]}
          genres={movie.genres}
        />

        {/* Top Floating Match Badge */}
        {hybridScore !== undefined && (
          <div className="absolute top-2 left-2">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-amber-500/50 text-amber-400 backdrop-blur-md">
              {hybridScore}% Match
            </span>
          </div>
        )}

        {/* Watchlist Quick Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(movie.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md transition-colors cursor-pointer ${
            inWatchlist
              ? 'bg-amber-500 border-amber-400 text-slate-950'
              : 'bg-slate-950/70 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
        <div
          onClick={() => onOpenDetails(movie, result)}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{movie.releaseYear || movie.releaseDate?.split('-')[0]}</span>
            <span>·</span>
            <span className="text-amber-400">★ {movie.voteAverage}</span>
            {movie.genres.includes('Bollywood') && (
              <>
                <span>·</span>
                <span className="text-[10px] font-semibold text-amber-400">Bollywood</span>
              </>
            )}
            {movie.genres.includes('South (Hindi Dubbed)') && (
              <>
                <span>·</span>
                <span className="text-[10px] font-semibold text-cyan-400">South (Hindi)</span>
              </>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-100 hover:text-amber-400 transition-colors line-clamp-1 mt-0.5">
            {movie.title}
          </h3>

          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {movie.genres.filter(g => g !== 'Bollywood' && g !== 'South (Hindi Dubbed)').slice(0, 2).join(', ') || movie.genres[0]}
          </div>

          {result?.reasons && result.reasons.length > 0 && (
            <div className="text-[10px] text-amber-400/80 truncate mt-1 italic">
              ✓ {result.reasons[0]}
            </div>
          )}
        </div>

        {/* Simple Like / Dislike Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onLike(movie.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Like</span>
            </button>

            <button
              onClick={() => onDislike(movie.id)}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isDisliked
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
              title="Dislike"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onOpenDetails(movie, result)}
            className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
