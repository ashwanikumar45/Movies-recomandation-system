import React from 'react';
import { User, MLProfileStats } from '../types.ts';
import { Cpu, Users, ThumbsUp, Star, ThumbsDown, Bookmark, Sparkles } from 'lucide-react';

interface MLStatsDrawerProps {
  user: User;
  stats: MLProfileStats | null;
  onOpenTuner: () => void;
}

export const MLStatsDrawer: React.FC<MLStatsDrawerProps> = ({
  user,
  stats,
  onOpenTuner,
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Computing latent taste vectors and similarity matrices...</p>
      </div>
    );
  }

  // Calculate highest genre score for scale
  const maxScore = Math.max(...stats.topGenres.map(g => Math.abs(g.score)), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">{user.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Active Test Subject
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user.tagline}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{user.bio}</p>
          </div>
        </div>

        {/* Quick Summary Counts */}
        <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <ThumbsUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-white">{stats.totalLikes}</div>
            <div className="text-[10px] text-slate-400">Likes</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <Star className="w-4 h-4 text-amber-300 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-white">{stats.totalSuperlikes}</div>
            <div className="text-[10px] text-slate-400">Superlikes</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <ThumbsDown className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-white">{stats.totalDislikes}</div>
            <div className="text-[10px] text-slate-400">Dislikes</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <Bookmark className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold font-mono text-white">{stats.totalWatchlist}</div>
            <div className="text-[10px] text-slate-400">Watchlist</div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Genre Vector Affinities & Collaborative Peer Similarities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Affinity Radar Bars */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Dynamic Genre Affinity Vector (TF-IDF Weighting)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Updated in real-time</span>
          </div>

          <p className="text-xs text-slate-400">
            Positive values indicate genres elevated by likes and superlikes. Negative values reflect penalized genres:
          </p>

          <div className="space-y-3 pt-2">
            {stats.topGenres.slice(0, 8).map((genreData) => {
              const isPositive = genreData.score >= 0;
              const widthPct = Math.min(100, Math.round((Math.abs(genreData.score) / maxScore) * 100));

              return (
                <div key={genreData.genre} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{genreData.genre}</span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isPositive ? 'text-cyan-400' : 'text-rose-400'
                      }`}
                    >
                      {genreData.score > 0 ? `+${genreData.score}` : genreData.score}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPositive ? 'bg-cyan-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collaborative Filtering: Peer Similarity Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Collaborative Peer Affinity (Pearson K-NN)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Cross-User Matrix</span>
          </div>

          <p className="text-xs text-slate-400">
            How closely <strong className="text-slate-200">{user.name}</strong> aligns with the other testing personas:
          </p>

          <div className="space-y-4 pt-2">
            {stats.userSimilarities.map((peer) => {
              const simPct = peer.similarity;
              const getBarColor = (pct: number) => {
                if (pct >= 70) return 'bg-amber-400';
                if (pct >= 40) return 'bg-cyan-400';
                return 'bg-slate-600';
              };

              return (
                <div key={peer.otherUserId} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-200">{peer.otherUserName}</div>
                    <div className="font-mono font-bold text-amber-400">{simPct}% Cosine Alignment</div>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${simPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${getBarColor(simPct)}`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {simPct >= 70
                      ? 'High taste overlap: films loved by this peer carry strong recommendation weight.'
                      : simPct >= 40
                      ? 'Moderate alignment: provides balanced diversity in collaborative recommendations.'
                      : 'Low affinity: distinct cinematic tastes; useful for anti-bubble discovery.'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick trigger to tune model weights */}
          <div className="pt-2">
            <button
              onClick={onOpenTuner}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Adjust Real-Time Ensemble Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
