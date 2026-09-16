'use client';

import React, { useState, useEffect } from 'react';
import { SessionType } from '../lib/types';
import { X, BookOpen, Repeat, Mic, Check, Hash } from 'lucide-react';
import { clsx } from 'clsx';

interface LogSessionDrawerProps {
  isOpen: boolean;
  initialType?: SessionType;
  selectedPages: number[];
  stumbledPages: Set<number>;
  onClose: () => void;
  onSubmitSession: (
    type: SessionType,
    pageNumbers: number[],
    stumbledPages: number[],
    notes: string
  ) => void;
}

export const LogSessionDrawer: React.FC<LogSessionDrawerProps> = ({
  isOpen,
  initialType = 'revise',
  selectedPages,
  stumbledPages,
  onClose,
  onSubmitSession
}) => {
  const [sessionType, setSessionType] = useState<SessionType>(initialType);
  const [pagesText, setPagesText] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setSessionType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (selectedPages.length > 0) {
      const sorted = [...selectedPages].sort((a, b) => a - b);
      setPagesText(sorted.join(', '));
    }
  }, [selectedPages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse pages text
    const parsedPages = new Set<number>();
    const parts = pagesText.split(',');

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

    const pageList = Array.from(parsedPages);
    if (pageList.length === 0) {
      alert('Please enter at least one valid page number between 1 and 604.');
      return;
    }

    const stumbledList = Array.from(stumbledPages).filter(p => pageList.includes(p));

    onSubmitSession(sessionType, pageList, stumbledList, notes);
    onClose();
  };

  const typesConfig: Array<{ type: SessionType; label: string; desc: string; icon: React.ReactNode }> = [
    {
      type: 'memorize',
      label: 'Memorization (Hifz)',
      desc: 'Log acquisition of new page(s)',
      icon: <BookOpen className="w-4 h-4 text-teal-deep" />
    },
    {
      type: 'revise',
      label: 'Revision (Murājaʿah)',
      desc: 'Systematic repetition & maintenance touch',
      icon: <Repeat className="w-4 h-4 text-amber-warm" />
    },
    {
      type: 'recite',
      label: 'Recitation (Tilāwah)',
      desc: 'Active testing or formal recitation',
      icon: <Mic className="w-4 h-4 text-sage-dark" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-modal overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-white px-4 py-3.5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Record Hifz Activity</h3>
            <p className="text-xs text-slate font-medium">
              Logged independently • Enforces Sunday week start continuity
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-surface-border hover:bg-surface text-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Session Type Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate">
              1. Activity Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {typesConfig.map(tc => (
                <button
                  key={tc.type}
                  type="button"
                  onClick={() => setSessionType(tc.type)}
                  className={clsx(
                    'p-3 rounded-xl border text-left flex items-center justify-between transition-all',
                    sessionType === tc.type
                      ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                      : 'bg-surface/50 border-surface-border text-slate hover:bg-surface'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {tc.icon}
                    <div>
                      <div className="text-xs font-bold text-ink">{tc.label}</div>
                      <div className="text-[11px] text-slate">{tc.desc}</div>
                    </div>
                  </div>

                  {sessionType === tc.type && (
                    <Check className="w-4 h-4 text-teal-deep shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Target Pages Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate flex items-center justify-between">
              <span>2. Target Pages (1–604)</span>
              <span className="text-[10px] text-teal-deep font-semibold">e.g. 262-267 or 1,2,3</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pagesText}
                onChange={e => setPagesText(e.target.value)}
                placeholder="Enter page ranges e.g. 282-286, 305"
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                required
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate">
              3. Session Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Smooth recitation, slight hesitation on ayah 14..."
              rows={2}
              className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold text-slate hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold shadow-sm transition-all"
            >
              Save Activity Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
