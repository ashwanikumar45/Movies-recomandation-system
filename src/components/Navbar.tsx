import React from 'react';
import { Film, Bookmark, Sparkles, Search } from 'lucide-react';
import { User } from '../types.ts';

interface NavbarProps {
  activeTab: 'recommendations' | 'discover' | 'watchlist';
  setActiveTab: (tab: 'recommendations' | 'discover' | 'watchlist') => void;
  currentUser: User;
  onOpenUserSwitcher: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUserSwitcher,
  watchlistCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand title, one line */}
        <button
          onClick={() => setActiveTab('recommendations')}
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white font-display cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>CineMatch</span>
        </button>

        {/* Zone 2: Simple, clean nav links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'recommendations'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'discover'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <span className="font-mono text-xs px-1.5 py-0.2 bg-slate-800 text-amber-400 rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 clean profile switch action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onOpenUserSwitcher}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 cursor-pointer transition-colors"
            title="Switch testing profile"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
            <span className="text-slate-500 text-[10px]">Switch</span>
          </button>
        </div>
      </div>
    </header>
  );
};
