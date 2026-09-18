'use client';

import React from 'react';
import { PageRetentionState } from '../lib/types';
import { X, Calendar, Activity, AlertTriangle, BookOpen, Layers } from 'lucide-react';
import { clsx } from 'clsx';

interface PageInspectorModalProps {
  page: PageRetentionState | null;
  onClose: () => void;
  onToggleMemorized: (pageNumber: number, currentMemorized: boolean) => void;
  onToggleStumble: (pageNumber: number) => void;
}

export const PageInspectorModal: React.FC<PageInspectorModalProps> = ({
  page,
  onClose,
  onToggleMemorized,
  onToggleStumble
}) => {
  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-2xl w-full max-w-md shadow-modal overflow-hidden">
        {/* Modal Header */}
        <div className="bg-teal-deep text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-sm">
              p.{page.pageNumber}
            </div>
            <div>
              <h3 className="text-sm font-bold">Surah {page.surahName}</h3>
              <p className="text-xs text-white/80">
                Juz {page.juzNumber} • Rubʿ {page.rubNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body — Heuristic Details */}
        <div className="p-4 space-y-4 text-ink">
          {/* Status Badge Row */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-surface border border-surface-border">
            <div>
              <div className="text-xs font-semibold text-slate">Memorization Status</div>
              <div className="text-sm font-bold text-ink">
                {page.isMemorized ? 'Memorized Page' : 'Unmemorized'}
              </div>
            </div>

            <button
              onClick={() => onToggleMemorized(page.pageNumber, page.isMemorized)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors',
                page.isMemorized
                  ? 'bg-sage-light text-teal-forest border-sage/40'
                  : 'bg-white text-slate border-surface-border hover:bg-surface'
              )}
            >
              {page.isMemorized ? 'Mark Unmemorized' : 'Mark Memorized'}
            </button>
          </div>

          {/* Memory Metrics Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate">
              Memory State Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {/* Dimension 1: Memory Strength */}
              <div className="p-3 rounded-xl border border-surface-border bg-white">
                <div className="flex items-center gap-1.5 text-xs text-slate font-medium mb-1">
                  <Activity className="w-3.5 h-3.5 text-teal-deep" />
                  <span>1. Memory Strength</span>
                </div>
                <div className="text-lg font-bold font-mono text-ink">
                  {page.totalTouches} touches
                </div>
                <div className="text-[11px] text-slate mt-0.5 capitalize">
                  Level: {page.masteryLevel === 'sand' ? 'Building' : page.masteryLevel === 'amber' ? 'Solid' : page.masteryLevel === 'sage' ? 'Mastered' : 'Unmemorized'}
                </div>
              </div>

              {/* Dimension 2: Memory Freshness */}
              <div className="p-3 rounded-xl border border-surface-border bg-white">
                <div className="flex items-center gap-1.5 text-xs text-slate font-medium mb-1">
                  <Calendar className="w-3.5 h-3.5 text-apricot-muted" />
                  <span>2. Memory Freshness</span>
                </div>
                <div className="text-lg font-bold font-mono text-ink">
                  {page.daysSinceTouch !== null ? `${page.daysSinceTouch}d unrevised` : '—'}
                </div>
                <div className="text-[11px] text-slate mt-0.5 capitalize">
                  Status: {page.decayLevel === 'fresh' ? 'Fresh' : page.decayLevel === 'cooling' ? 'Cooling' : page.decayLevel === 'decaying' ? 'Needs Review' : 'Unmemorized'}
                </div>
              </div>
            </div>
          </div>

          {/* Stumble Record */}
          <div className="p-3 rounded-xl border border-surface-border bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={clsx(
                'w-4 h-4',
                page.stumbled ? 'text-apricot-muted' : 'text-slate-light'
              )} />
              <div>
                <div className="text-xs font-bold text-ink">Stumble Flag</div>
                <div className="text-[11px] text-slate">
                  {page.stumbled ? 'Priority testing active (24–48h)' : 'No recent stumble recorded'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onToggleStumble(page.pageNumber)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
                page.stumbled
                  ? 'bg-apricot-light text-apricot-muted border-apricot-muted/30'
                  : 'bg-surface text-slate border-surface-border hover:bg-white'
              )}
            >
              {page.stumbled ? 'Clear Flag' : 'Flag Stumble'}
            </button>
          </div>

          {/* Transparency Disclaimer */}
          <p className="text-[11px] text-slate-light leading-relaxed font-medium">
            RABT does not use black-box AI or hidden Anki algorithms. Metrics are direct mathematical evaluations of total touches and days elapsed since last revision log.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface p-3 border-t border-surface-border text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
