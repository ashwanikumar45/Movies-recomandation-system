import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface MoviePosterProps {
  src?: string;
  alt: string;
  title: string;
  year?: number | string;
  genres?: string[];
  className?: string;
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  alt,
  title,
  year,
  genres = [],
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source or failed to load, display styled fallback card
  if (!src || hasError) {
    const isBollywood = genres.includes('Bollywood');
    const isSouth = genres.includes('South (Hindi Dubbed)');

    return (
      <div
        className={`w-full h-full relative flex flex-col justify-between p-4 bg-gradient-to-br ${
          isBollywood
            ? 'from-amber-950/80 via-slate-900 to-slate-950 border-amber-900/30'
            : isSouth
            ? 'from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-900/30'
            : 'from-slate-850 via-slate-900 to-slate-950 border-slate-800'
        } border select-none ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <Film className="w-4 h-4 text-amber-400" />
          {year && <span>{year}</span>}
        </div>

        <div className="my-auto text-center space-y-1 py-2">
          <div className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-3 font-display leading-snug">
            {title}
          </div>
          {genres.length > 0 && (
            <div className="text-[10px] text-amber-400/90 font-medium line-clamp-1">
              {genres[0]}
            </div>
          )}
        </div>

        <div className="text-[9px] text-center text-slate-500 uppercase tracking-widest">
          CineMatch
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 ${className}`}>
      {/* Loading shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
          <Film className="w-6 h-6 text-slate-700 animate-bounce" />
        </div>
      )}

      <img
        src={src}
        alt={alt || title}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
