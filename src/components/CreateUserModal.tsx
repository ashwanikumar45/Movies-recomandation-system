import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { User } from '../types.ts';

interface CreateUserModalProps {
  onClose: () => void;
  onCreate: (user: Partial<User>) => void;
}

const ALL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'History',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western',
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(['Science Fiction']);
  const [dislikedGenres, setDislikedGenres] = useState<string[]>(['Horror']);

  const toggleFavGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
      setDislikedGenres(dislikedGenres.filter(g => g !== genre));
    }
  };

  const toggleDislikedGenre = (genre: string) => {
    if (dislikedGenres.includes(genre)) {
      setDislikedGenres(dislikedGenres.filter(g => g !== genre));
    } else {
      setDislikedGenres([...dislikedGenres, genre]);
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      tagline: tagline.trim() || 'Custom Cinephile Tester',
      bio: bio.trim() || 'Custom persona for verifying machine learning recommendation effects.',
      favoriteGenres,
      dislikedGenres,
      primaryColor: '#8b5cf6',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Create Custom Testing Persona</h3>
              <p className="text-xs text-slate-400">Configure distinct preferences to evaluate ML response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jordan Miller"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., Horror & Creature Feature Enthusiast"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Favorite Genres (Positive Taste Vector Boost)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.map((g) => {
                const isFav = favoriteGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleFavGenre(g)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Disliked Genres (Negative Penalty Vector)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.map((g) => {
                const isDisliked = dislikedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleDislikedGenre(g)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isDisliked
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              Create Persona & Switch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
