import React, { useState } from 'react';
import { X, SlidersHorizontal, Sparkles, Users, Cpu, RotateCcw } from 'lucide-react';
import { RecommenderWeights } from '../types.ts';

interface MLTunerModalProps {
  currentWeights: RecommenderWeights;
  onApplyWeights: (weights: RecommenderWeights) => void;
  onClose: () => void;
}

export const MLTunerModal: React.FC<MLTunerModalProps> = ({
  currentWeights,
  onApplyWeights,
  onClose,
}) => {
  const [contentWeight, setContentWeight] = useState(currentWeights.contentWeight);
  const [collabWeight, setCollabWeight] = useState(currentWeights.collabWeight);
  const [semanticWeight, setSemanticWeight] = useState(currentWeights.semanticWeight);

  // Normalize percentages for visual clarity
  const total = contentWeight + collabWeight + semanticWeight || 1;
  const pctContent = Math.round((contentWeight / total) * 100);
  const pctCollab = Math.round((collabWeight / total) * 100);
  const pctSemantic = 100 - pctContent - pctCollab;

  const handleApply = (c: number, col: number, s: number) => {
    setContentWeight(c);
    setCollabWeight(col);
    setSemanticWeight(s);
    onApplyWeights({ contentWeight: c, collabWeight: col, semanticWeight: s });
  };

  const applyPreset = (preset: 'balanced' | 'content' | 'collab' | 'semantic') => {
    switch (preset) {
      case 'balanced':
        handleApply(0.40, 0.35, 0.25);
        break;
      case 'content':
        handleApply(0.70, 0.15, 0.15);
        break;
      case 'collab':
        handleApply(0.15, 0.70, 0.15);
        break;
      case 'semantic':
        handleApply(0.20, 0.20, 0.60);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Hybrid ML Model Tuner</h3>
              <p className="text-xs text-slate-400">Calibrate ensemble weights for real-time ranking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Composition Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Ensemble Composition</span>
            <span className="text-slate-200">
              {pctContent}% Content · {pctCollab}% Collab · {pctSemantic}% AI
            </span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${pctContent}%` }}
              className="bg-cyan-500 h-full transition-all duration-200"
              title="Content-Based Filter"
            />
            <div
              style={{ width: `${pctCollab}%` }}
              className="bg-amber-500 h-full transition-all duration-200"
              title="Collaborative Filter"
            />
            <div
              style={{ width: `${pctSemantic}%` }}
              className="bg-rose-500 h-full transition-all duration-200"
              title="AI Semantic Reasoning"
            />
          </div>
        </div>

        {/* Preset Buttons */}
        <div>
          <span className="text-xs text-slate-400 font-medium block mb-2">Architectural Presets:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyPreset('balanced')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-200">Balanced Hybrid</div>
              <div className="text-[10px] text-slate-400">40% Content / 35% Collab / 25% AI</div>
            </button>
            <button
              onClick={() => applyPreset('content')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-cyan-400">Auteur / Content Heavy</div>
              <div className="text-[10px] text-slate-400">70% Genre, Director & Themes</div>
            </button>
            <button
              onClick={() => applyPreset('collab')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-amber-400">Crowd Collaborative</div>
              <div className="text-[10px] text-slate-400">70% Peer rating matrix & K-NN</div>
            </button>
            <button
              onClick={() => applyPreset('semantic')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-rose-400">Gemini Semantic AI</div>
              <div className="text-[10px] text-slate-400">60% Latent reasoning & themes</div>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          {/* Content-Based Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                Content-Based Filtering (Cosine Similarity)
              </span>
              <span className="font-mono text-slate-300 font-bold">{Math.round(contentWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={contentWeight}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setContentWeight(val);
                onApplyWeights({ contentWeight: val, collabWeight, semanticWeight });
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Matches your specific taste vector in genres, directors, and keywords.
            </p>
          </div>

          {/* Collaborative Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Users className="w-3.5 h-3.5" />
                Collaborative Filtering (Peer K-NN Matrix)
              </span>
              <span className="font-mono text-slate-300 font-bold">{Math.round(collabWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={collabWeight}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCollabWeight(val);
                onApplyWeights({ contentWeight, collabWeight: val, semanticWeight });
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Learns from how Maya, Marcus, and Elena rated and liked other films.
            </p>
          </div>

          {/* Semantic Reasoning Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini Semantic AI Resonance
              </span>
              <span className="font-mono text-slate-300 font-bold">{Math.round(semanticWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={semanticWeight}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSemanticWeight(val);
                onApplyWeights({ contentWeight, collabWeight, semanticWeight: val });
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Uses deep semantic understanding of pacing, emotional subtext, and narrative atmosphere.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => applyPreset('balanced')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to default</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
