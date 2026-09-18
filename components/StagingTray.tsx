'use client';

import React, { useState } from 'react';
import { SessionType } from '../lib/types';
import { AlertTriangle, Check, X, Hash, BookOpen, Repeat, Mic, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { MistakeTagSelector } from './MistakeTagSelector';

interface StagingTrayProps {
  selectedPages: number[];
  stumbledStagingPages: Set<number>;
  totalPages?: number;
  onSelectPages: (pageNumbers: number[]) => void;
  onClearSelection: () => void;
  onToggleStumbleForSelected: () => void;
  onSubmitSession: (
    type: SessionType,
    pageNumbers: number[],
    stumbledPages: number[],
    notes: string
  ) => void;
}

export const StagingTray: React.FC<StagingTrayProps> = ({
  selectedPages,
  stumbledStagingPages,
  totalPages = 604,
  onSelectPages,
  onClearSelection,
  onToggleStumbleForSelected,
  onSubmitSession
}) => {
  const [rangeInput, setRangeInput] = useState('');
  const [showRangeInput, setShowRangeInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Parse numeric range e.g. "282-286" or "10,11,12"
  const handleApplyRangeInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rangeInput.trim()) return;

    const parsedPages = new Set<number>();
    const parts = rangeInput.split(',');

    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(totalPages, Math.min(start, end)));
          const max = Math.max(1, Math.min(totalPages, Math.max(start, end)));
          for (let p = min; p <= max; p++) {
            parsedPages.add(p);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
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

  // Submit session directly from 1-tap buttons
  const handleQuickSubmit = (type: SessionType) => {
    if (selectedPages.length === 0) return;
    const stumbledList = Array.from(stumbledStagingPages).filter(p => selectedPages.includes(p));
    let combinedNotes = notesText.trim();
    if (selectedTags.length > 0) {
      const tagLabels = selectedTags.join(', ');
      combinedNotes = combinedNotes ? `[Tags: ${tagLabels}] ${combinedNotes}` : `[Tags: ${tagLabels}]`;
    }
    onSubmitSession(type, selectedPages, stumbledList, combinedNotes);
    setNotesText('');
    setSelectedTags([]);
    setShowNoteInput(false);
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
    <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-20">
      <div className="bg-ink text-white rounded-2xl p-3.5 shadow-modal border border-teal-deep/30 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
        {/* Top Header: Selection Details & Fast Toggles */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-1.5">
            {/* Stumble Toggle */}
            <button
              onClick={onToggleStumbleForSelected}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors',
                anyStumbled
                  ? 'bg-apricot-muted/20 border-apricot-muted text-apricot-muted'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              )}
              title="Flag stumble — priority re-testing scheduled"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-apricot-muted" />
              <span className="hidden sm:inline">{anyStumbled ? 'Stumbled Flagged' : 'Flag Stumble'}</span>
            </button>

            {/* Note Toggle */}
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={clsx(
                'p-1.5 rounded-xl border text-xs font-semibold transition-colors',
                showNoteInput || notesText
                  ? 'bg-teal-light/20 border-teal-deep text-teal-light'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              )}
              title="Add Session Notes"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Range Input Toggle */}
            <button
              onClick={() => setShowRangeInput(!showRangeInput)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="Fast Range Fallback"
            >
              <Hash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Surface Inline Mistake Classification */}
        {(anyStumbled || showNoteInput) && (
          <div className="space-y-2.5 animate-in fade-in bg-white/10 p-3 rounded-xl border border-white/15">
            <MistakeTagSelector
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />

            <input
              type="text"
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="Session notes (e.g., slight hesitation on ayah 14)..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-light focus:outline-none focus:ring-1 focus:ring-teal-light"
            />
          </div>
        )}

        {/* Action Buttons Row: 1-Tap Logging */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <button
            onClick={() => handleQuickSubmit('revise')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold shadow-sm transition-all"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Log Revise</span>
          </button>

          <button
            onClick={() => handleQuickSubmit('memorize')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-warm/80 hover:bg-amber-warm text-white text-xs font-bold shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Log Hifz</span>
          </button>

          <button
            onClick={() => handleQuickSubmit('recite')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sage-dark/80 hover:bg-sage-dark text-white text-xs font-bold shadow-sm transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Log Recite</span>
          </button>
        </div>
      </div>

      {/* Fast Numeric Range Input Dialog */}
      {showRangeInput && (
        <form
          onSubmit={handleApplyRangeInput}
          className="mt-2 bg-white border border-surface-border rounded-2xl p-3 shadow-modal flex items-center gap-2 animate-in fade-in"
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
