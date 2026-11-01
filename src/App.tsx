import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './api.ts';
import { User, RecommendationResult, Movie, Interaction, WatchlistItem } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { UserSwitcherModal } from './components/UserSwitcherModal.tsx';
import { HeroFeatured } from './components/HeroFeatured.tsx';
import { MovieCard } from './components/MovieCard.tsx';
import { MovieModal } from './components/MovieModal.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { WatchlistView } from './components/WatchlistView.tsx';
import { Toast } from './components/Toast.tsx';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const [activeTab, setActiveTab] = useState<'recommendations' | 'discover' | 'watchlist'>('recommendations');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedResult, setSelectedResult] = useState<RecommendationResult | undefined>(undefined);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'ml' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'ml' | 'info' = 'ml') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // Initial load: Fetch users
  useEffect(() => {
    const init = async () => {
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setCurrentUser(fetchedUsers[0]);
        }
      } catch (err) {
        console.error('Failed to initialize users:', err);
      }
    };
    init();
  }, []);

  // Fetch recommendations and user data
  const loadUserData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [recsRes, wl, ints] = await Promise.all([
        api.getRecommendations(userId, 12),
        api.getWatchlist(userId),
        api.getInteractions(userId),
      ]);
      setRecommendations(recsRes.recommendations);
      setWatchlist(wl);
      setInteractions(ints);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    }
  }, [currentUser, loadUserData]);

  const watchlistMovieIds = useMemo(() => new Set(watchlist.map((w) => w.movieId)), [watchlist]);
  const interactionsMap = useMemo(() => {
    const map = new Map<string, Interaction>();
    interactions.forEach((i) => map.set(i.movieId, i));
    return map;
  }, [interactions]);

  const handleSelectUser = (user: User) => {
    if (user.id === currentUser?.id) return;
    setCurrentUser(user);
    showToast(`Switched profile to ${user.name.split(' ')[0]}`, 'info');
  };

  const handleNextUser = () => {
    if (!currentUser || users.length === 0) return;
    const currentIndex = users.findIndex((u) => u.id === currentUser.id);
    const nextUser = users[(currentIndex + 1) % Math.min(3, users.length)];
    handleSelectUser(nextUser);
  };

  const handleRecordInteraction = async (
    movieId: string,
    type: 'like' | 'superlike' | 'dislike'
  ) => {
    if (!currentUser) return;
    try {
      const { interaction } = await api.recordInteraction(
        currentUser.id,
        movieId,
        type
      );

      setInteractions((prev) => {
        const filtered = prev.filter((i) => i.movieId !== movieId);
        return [...filtered, interaction];
      });

      // Recalculate recommendations in real-time
      const recsRes = await api.getRecommendations(currentUser.id, 12);
      setRecommendations(recsRes.recommendations);

      showToast(
        type === 'like' || type === 'superlike'
          ? 'Liked! Recommendations updated.'
          : 'Disliked. Filtered from recommendations.',
        'ml'
      );
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  };

  const handleToggleWatchlist = async (movieId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.toggleWatchlist(currentUser.id, movieId);
      const updatedWl = await api.getWatchlist(currentUser.id);
      setWatchlist(updatedWl);

      if (res.inWatchlist) {
        showToast('Saved to Watchlist', 'success');
      } else {
        showToast('Removed from Watchlist', 'info');
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handleToggleWatched = async (movieId: string, watched: boolean) => {
    if (!currentUser) return;
    try {
      await api.setWatchedStatus(currentUser.id, movieId, watched);
      const updatedWl = await api.getWatchlist(currentUser.id);
      setWatchlist(updatedWl);
      showToast(watched ? 'Marked as watched' : 'Marked as unwatched', 'success');
    } catch (err) {
      console.error('Failed to update watched status:', err);
    }
  };

  const handleOpenDetails = (movie: Movie, result?: RecommendationResult) => {
    setSelectedMovie(movie);
    setSelectedResult(result);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    setSelectedResult(undefined);
  };

  const [recFilter, setRecFilter] = useState<'all' | 'bollywood' | 'south' | 'action' | 'drama'>('all');

  const topPick = recommendations[0];
  const secondaryPicks = recommendations.slice(1);

  const filteredPicks = useMemo(() => {
    if (recFilter === 'all') return secondaryPicks;
    if (recFilter === 'bollywood') {
      return secondaryPicks.filter((r) => r.movie.genres.includes('Bollywood'));
    }
    if (recFilter === 'south') {
      return secondaryPicks.filter((r) => r.movie.genres.includes('South (Hindi Dubbed)'));
    }
    if (recFilter === 'action') {
      return secondaryPicks.filter((r) =>
        r.movie.genres.some((g) => ['Action', 'Thriller', 'Crime'].includes(g))
      );
    }
    if (recFilter === 'drama') {
      return secondaryPicks.filter((r) =>
        r.movie.genres.some((g) => ['Drama', 'Romance', 'Comedy'].includes(g))
      );
    }
    return secondaryPicks;
  }, [secondaryPicks, recFilter]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* CineMatch Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-xs">Finding best matches for {currentUser.name.split(' ')[0]}...</p>
          </div>
        ) : (
          <>
            {/* 1. RECOMMENDATIONS TAB */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* Hero Feature: Top Pick */}
                {topPick && (
                  <HeroFeatured
                    topPick={topPick}
                    userName={currentUser.name}
                    onOpenDetails={(r) => handleOpenDetails(r.movie, r)}
                    onLike={(mId) => handleRecordInteraction(mId, 'like')}
                    onDislike={(mId) => handleRecordInteraction(mId, 'dislike')}
                    onToggleWatchlist={handleToggleWatchlist}
                    inWatchlist={watchlistMovieIds.has(topPick.movie.id)}
                    currentInteraction={interactionsMap.get(topPick.movie.id)}
                  />
                )}

                {/* Grid Header */}
                {/* Grid Header & Simple Filter Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-base font-bold text-white font-display">
                      Recommended For You
                    </h2>
                  </div>

                  {/* Simple Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: 'All Picks' },
                      { id: 'bollywood', label: 'Bollywood (Hindi)' },
                      { id: 'south', label: 'South (Hindi Dubbed)' },
                      { id: 'action', label: 'Action & Thriller' },
                      { id: 'drama', label: 'Drama & Romance' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setRecFilter(cat.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          recFilter === cat.id
                            ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clean, Simple Movie Grid */}
                {filteredPicks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-slate-800 p-6">
                    No recommendations found in this category. Try selecting "All Picks".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredPicks.map((result) => (
                      <MovieCard
                        key={result.movie.id}
                        result={result}
                        onOpenDetails={(m, r) => handleOpenDetails(m, r)}
                        onLike={(mId) => handleRecordInteraction(mId, 'like')}
                        onDislike={(mId) => handleRecordInteraction(mId, 'dislike')}
                        onToggleWatchlist={handleToggleWatchlist}
                        inWatchlist={watchlistMovieIds.has(result.movie.id)}
                        interaction={interactionsMap.get(result.movie.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. SEARCH TAB */}
            {activeTab === 'discover' && (
              <DiscoverView
                onOpenDetails={(m) => handleOpenDetails(m)}
                onLike={(mId) => handleRecordInteraction(mId, 'like')}
                onDislike={(mId) => handleRecordInteraction(mId, 'dislike')}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistMovieIds={watchlistMovieIds}
                interactionsMap={interactionsMap}
              />
            )}

            {/* 3. WATCHLIST TAB */}
            {activeTab === 'watchlist' && (
              <WatchlistView
                watchlist={watchlist}
                onToggleWatched={handleToggleWatched}
                onRemove={(mId) => handleToggleWatchlist(mId)}
                onOpenDetails={(m) => handleOpenDetails(m)}
                onGoToRecommendations={() => setActiveTab('recommendations')}
              />
            )}
          </>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <p>CineMatch · Simple Machine Learning Movie Recommendations</p>
      </footer>

      {/* Simple Movie Details & Trailer Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          result={selectedResult}
          onClose={handleCloseModal}
          onLike={(mId) => handleRecordInteraction(mId, 'like')}
          onDislike={(mId) => handleRecordInteraction(mId, 'dislike')}
          onToggleWatchlist={handleToggleWatchlist}
          inWatchlist={watchlistMovieIds.has(selectedMovie.id)}
          interaction={interactionsMap.get(selectedMovie.id)}
        />
      )}

      {/* Profile Switcher Modal */}
      {isUserSwitcherOpen && (
        <UserSwitcherModal
          users={users}
          currentUserId={currentUser.id}
          onSelectUser={handleSelectUser}
          onClose={() => setIsUserSwitcherOpen(false)}
        />
      )}

      {/* Feedback Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
