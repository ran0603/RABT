'use client';

import React, { useState } from 'react';
import { SessionType } from '../lib/types';
import { AlertTriangle, Check, X, Play, Hash } from 'lucide-react';
import { clsx } from 'clsx';

interface StagingTrayProps {
  selectedPages: number[];
  stumbledStagingPages: Set<number>;
  onSelectPages: (pageNumbers: number[]) => void;
  onClearSelection: () => void;
  onToggleStumbleForSelected: () => void;
  onOpenLogModal: (type: SessionType) => void;
}

export const StagingTray: React.FC<StagingTrayProps> = ({
  selectedPages,
  stumbledStagingPages,
  onSelectPages,
  onClearSelection,
  onToggleStumbleForSelected,
  onOpenLogModal
}) => {
  const [rangeInput, setRangeInput] = useState('');
  const [showRangeInput, setShowRangeInput] = useState(false);

  // Parse numeric range e.g. "282-286" or "10,11,12"
  const handleApplyRangeInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rangeInput.trim()) return;

    const parsedPages = new Set<number>();

    // Split by comma
    const parts = rangeInput.split(',');
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(604, Math.min(start, end)));
          const max = Math.max(1, Math.min(604, Math.max(start, end)));
          for (let p = min; p <= max; p++) {
            parsedPages.add(p);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= 604) {
          parsedPages.add(num);
        }
      }
    });

    if (parsedPages.size > 0) {
      onSelectPages(Array.from(parsedPages).sort((a, b) => a - b));
      setRangeInput('');
      setShowRangeInput(false);
    }
  };

  // Format page range representation e.g. "[262..267]"
  const formatSelectionRange = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const sorted = [...pages].sort((a, b) => a - b);
    if (sorted.length === 1) return `Page ${sorted[0]}`;

    let isContiguous = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        isContiguous = false;
        break;
      }
    }

    if (isContiguous) {
      return `[${sorted[0]}..${sorted[sorted.length - 1]}] (${sorted.length} pages)`;
    }

    return `${sorted.length} pages selected`;
  };

  if (selectedPages.length === 0 && !showRangeInput) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-20">
        <div className="bg-white border border-surface-border rounded-2xl p-2.5 shadow-modal flex items-center justify-between">
          <span className="text-xs font-medium text-slate pl-2">
            Tap or scrub pages to stage for logging
          </span>
          <button
            onClick={() => setShowRangeInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border hover:bg-surface text-xs font-semibold text-teal-deep transition-colors"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Range Input (e.g. 282-286)</span>
          </button>
        </div>
      </div>
    );
  }

  const anyStumbled = selectedPages.some(p => stumbledStagingPages.has(p));

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-20">
      <div className="bg-ink text-white rounded-2xl p-3.5 shadow-modal border border-teal-deep/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
        {/* Selection Details */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {formatSelectionRange(selectedPages)}
            </div>
            <div className="text-[11px] text-slate-light font-medium">
              {anyStumbled ? 'Contains flagged stumbles' : 'Ready to record activity'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Stumble Flagging Toggle */}
          <button
            onClick={onToggleStumbleForSelected}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0',
              anyStumbled
                ? 'bg-apricot-muted/20 border-apricot-muted text-apricot-muted'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            )}
            title="Flag stumble — priority re-testing without erasing lifetime wear"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-apricot-muted" />
            <span>{anyStumbled ? 'Stumbled Flagged' : 'Flag Stumble'}</span>
          </button>

          {/* Range input toggle */}
          <button
            onClick={() => setShowRangeInput(!showRangeInput)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
            title="Fast Numeric Range Fallback"
          >
            <Hash className="w-4 h-4" />
          </button>

          {/* Log Revision Action */}
          <button
            onClick={() => onOpenLogModal('revise')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>Log Revise</span>
          </button>
        </div>
      </div>

      {/* Fast Numeric Range Input Dialog */}
      {showRangeInput && (
        <form
          onSubmit={handleApplyRangeInput}
          className="mt-2 bg-white border border-surface-border rounded-2xl p-3 shadow-modal flex items-center gap-2"
        >
          <input
            type="text"
            value={rangeInput}
            onChange={e => setRangeInput(e.target.value)}
            placeholder="Enter range e.g. 282-286 or 10,11,12"
            className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-forest transition-colors"
          >
            Apply Range
          </button>
        </form>
      )}
    </div>
  );
};
