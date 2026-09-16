'use client';

import React from 'react';
import { X, ShieldCheck, Sparkles, Layers, Activity, Calendar } from 'lucide-react';

interface LegendDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendDrawer: React.FC<LegendDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-2xl w-full max-w-lg shadow-modal overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-teal-deep text-white p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>RABT Heuristics & Brand Philosophy</span>
            </h3>
            <p className="text-xs text-white/80">
              رَبْط — Quiet, precise instrument for Hifz retention
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-ink overflow-y-auto">
          {/* Philosophy Section */}
          <div className="p-3 rounded-xl bg-surface border border-surface-border">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-deep uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Instrument, Not Coach</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              RABT observes and presents the state of your Hifz record. It strictly avoids gamification (no XP, badges, leaderboards, or confetti). Every calculated metric is transparent and inspectable.
            </p>
          </div>

          {/* Two-Tone Heatmap Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate">
              Two-Tone Wear & Decay Heatmap Matrix
            </h4>
            <p className="text-xs text-slate">
              Every page cell (1–604) communicates two independent dimensions:
            </p>

            {/* Dimension 1 */}
            <div className="p-3 rounded-xl border border-surface-border bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>1. Lifetime Mastery — Hue / Depth</span>
                <span className="text-[10px] text-slate font-medium">Revision Touches</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded bg-surface border border-surface-border text-slate">
                  <strong>0Touches:</strong> Translucent Sand
                </div>
                <div className="p-1.5 rounded bg-amber-light/40 border border-amber-warm/30 text-ink">
                  <strong>1–10 Touches:</strong> Pale Sand
                </div>
                <div className="p-1.5 rounded bg-amber-warm/20 border border-amber-warm/50 text-ink">
                  <strong>11–25 Touches:</strong> Warm Amber
                </div>
                <div className="p-1.5 rounded bg-sage-light border border-sage/40 text-teal-forest">
                  <strong>26+ Touches:</strong> Sage Green
                </div>
              </div>
            </div>

            {/* Dimension 2 */}
            <div className="p-3 rounded-xl border border-surface-border bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>2. Current Decay — Opacity / Wash</span>
                <span className="text-[10px] text-slate font-medium">Days Since Touch</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded bg-white border border-teal-deep/30 text-ink">
                  <strong>0–7 days:</strong> 100% Fresh
                </div>
                <div className="p-1.5 rounded bg-surface border border-surface-border text-slate">
                  <strong>8–21 days:</strong> Cooling (70%)
                </div>
                <div className="p-1.5 rounded bg-slate-faint border border-slate/30 text-slate">
                  <strong>22+ days:</strong> Decaying Wash
                </div>
              </div>
            </div>
          </div>

          {/* Natural Contiguity Section */}
          <div className="p-3 rounded-xl border border-surface-border bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Sparkles className="w-3.5 h-3.5 text-apricot-muted" />
              <span>Natural Contiguity Suggestion Engine</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Groups pages into Hizb quarters and Surah boundaries to calculate staleness scores (<code className="bg-surface px-1 py-0.5 rounded text-[10px]">average days since revision</code>). Surfaces the 3 stalest contiguous clusters as quick-fill chips.
            </p>
          </div>

          {/* Independent Streaks Section */}
          <div className="p-3 rounded-xl border border-surface-border bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Calendar className="w-3.5 h-3.5 text-teal-deep" />
              <span>Independent Activity Streaks & Forgiveness</span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Tracks <strong>Memorization</strong>, <strong>Revision</strong>, and <strong>Recitation</strong> completely independently. Week start day is <strong>Sunday</strong>. Streaks remain alive if logged Today or Yesterday to prevent midnight cliff penalties.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface p-3 border-t border-surface-border text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
