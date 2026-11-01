import React from 'react';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'ml' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'ml', onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-750 shadow-2xl text-xs text-slate-200 animate-in slide-in-from-bottom-5 duration-300">
      {type === 'ml' && (
        <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      )}
      {type === 'success' && (
        <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
      {type === 'info' && (
        <span className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
        </span>
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-500 hover:text-slate-300 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};
