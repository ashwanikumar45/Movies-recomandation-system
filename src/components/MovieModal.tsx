import React, { useState } from 'react';
import { X, Play, Bookmark, ThumbsUp, ThumbsDown, Sparkles, Check } from 'lucide-react';
import { Movie, RecommendationResult, Interaction } from '../types.ts';
import { MoviePoster } from './MoviePoster.tsx';

interface MovieModalProps {
  movie: Movie;
  result?: RecommendationResult;
  onClose: () => void;
  onLike: (movieId: string) => void;
  onDislike: (movieId: string) => void;
  onToggleWatchlist: (movieId: string) => void;
  inWatchlist: boolean;
  interaction?: Interaction;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  result,
  onClose,
  onLike,
  onDislike,
  onToggleWatchlist,
  inWatchlist,
  interaction,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const trailerKey = movie.trailerKey;
  const isLiked = interaction?.type === 'like' || interaction?.type === 'superlike';
  const isDisliked = interaction?.type === 'dislike';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Player */}
        <div className="relative aspect-video w-full bg-slate-950 shrink-0">
          {isPlayingTrailer && trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full group">
              <MoviePoster
                src={movie.backdropPath || movie.posterPath}
                alt={movie.title}
                title={movie.title}
                year={movie.releaseYear || movie.releaseDate.split('-')[0]}
                genres={movie.genres}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

              {trailerKey ? (
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg">
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-xs">Play Trailer</span>
                  </div>
                </button>
              ) : (
                <div className="absolute bottom-3 left-4 text-xs text-slate-400">
                  Trailer not available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Info */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>{movie.releaseYear || movie.releaseDate.split('-')[0]}</span>
                <span>·</span>
                <span>{movie.runtime}m</span>
                <span>·</span>
                <span>Dir. {movie.director || 'Various'}</span>
                <span>·</span>
                <span className="text-amber-400 font-semibold">★ {movie.voteAverage}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display">
                {movie.title}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleWatchlist(movie.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  inWatchlist
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
              </button>

              <button
                onClick={() => onLike(movie.id)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Like"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDislike(movie.id)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isDisliked
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400'
                }`}
                title="Dislike"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Match Reason */}
          {result && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{result.hybridScore}% Match</span>
              </div>
              <p className="text-slate-300 italic">{result.explanation}</p>
            </div>
          )}

          {/* Synopsis */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {movie.overview}
            </p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-slate-300"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
