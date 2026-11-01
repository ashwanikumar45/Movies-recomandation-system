import React from 'react';
import { X, Check } from 'lucide-react';
import { User } from '../types.ts';

interface UserSwitcherModalProps {
  users: User[];
  currentUserId: string;
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  users,
  currentUserId,
  onSelectUser,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-display">Switch Testing Profile</h3>
            <p className="text-xs text-slate-400">Select a persona to test real-time recommendation updates</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Profile Cards */}
        <div className="space-y-2.5">
          {users.slice(0, 3).map((u) => {
            const isActive = u.id === currentUserId;
            const tasteTag =
              u.id === 'user_maya'
                ? 'Sci-Fi, Dystopia & Cyberpunk'
                : u.id === 'user_marcus'
                ? 'Psychological Thrillers & Neo-Noir'
                : 'Indie Romance, Drama & Ghibli';

            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      {u.name}
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-400/90 font-medium">{u.tagline}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tasteTag}</div>
                  </div>
                </div>

                {isActive && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
