import React from 'react';
import { Play, Bookmark, ThumbsUp, ThumbsDown, Sparkles, Check } from 'lucide-react';
import { RecommendationResult, Interaction } from '../types.ts';
import { MoviePoster } from './MoviePoster.tsx';

interface HeroFeaturedProps {
  topPick: RecommendationResult;
  userName: string;
  onOpenDetails: (result: RecommendationResult) => void;
  onLike: (movieId: string) => void;
  onDislike: (movieId: string) => void;
  onToggleWatchlist: (movieId: string) => void;
  inWatchlist: boolean;
  currentInteraction?: Interaction;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  topPick,
  userName,
  onOpenDetails,
  onLike,
  onDislike,
  onToggleWatchlist,
  inWatchlist,
  currentInteraction,
}) => {
  const { movie, hybridScore, explanation } = topPick;
  const isLiked = currentInteraction?.type === 'like' || currentInteraction?.type === 'superlike';
  const isDisliked = currentInteraction?.type === 'dislike';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl mb-8 group">
      {/* Background Poster */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropPath || movie.posterPath}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 group-hover:scale-102 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/src/assets/images/hero_cinema_lens_1793551990161.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>#1 Recommendation for {userName.split(' ')[0]} ({hybridScore}% Match)</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white font-display mb-2">
            {movie.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-300 mb-3">
            <span>{movie.releaseYear || movie.releaseDate.split('-')[0]}</span>
            <span>·</span>
            <span>{movie.runtime}m</span>
            <span>·</span>
            <span>Dir. {movie.director || 'Various'}</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">★ {movie.voteAverage}</span>
            {movie.genres.includes('Bollywood') && (
              <>
                <span>·</span>
                <span className="text-amber-400 font-semibold">Bollywood</span>
              </>
            )}
            {movie.genres.includes('South (Hindi Dubbed)') && (
              <>
                <span>·</span>
                <span className="text-cyan-400 font-semibold">South (Hindi)</span>
              </>
            )}
            <span>·</span>
            <span className="text-slate-400">{movie.genres.filter(g => g !== 'Bollywood' && g !== 'South (Hindi Dubbed)').slice(0, 2).join(', ')}</span>
          </div>

          <p className="text-xs text-slate-300 italic mb-4 max-w-lg">
            "{explanation}"
          </p>

          {/* Simple CTA actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenDetails(topPick)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Trailer</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                inWatchlist
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{inWatchlist ? 'Saved' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => onLike(movie.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
              }`}
              title="Dislike"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Poster preview */}
        <div
          onClick={() => onOpenDetails(topPick)}
          className="hidden md:block w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors"
        >
          <MoviePoster
            src={movie.posterPath}
            alt={movie.title}
            title={movie.title}
            year={movie.releaseYear || movie.releaseDate?.split('-')[0]}
            genres={movie.genres}
          />
        </div>
      </div>
    </div>
  );
};
