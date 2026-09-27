'use client';

import React, { useState, useMemo } from 'react';
import { StudySession, SessionPage, SessionType } from '../lib/types';
import {
  X,
  History,
  Trash2,
  BookOpen,
  Search,
  Calendar,
  AlertTriangle,
  BookMarked,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  sessionPages: SessionPage[];
  onDeleteSession: (sessionId: string) => Promise<void>;
}

function formatPageRanges(pageNumbers: number[]): string {
  if (!pageNumbers.length) return '0 pages';
  const sorted = [...new Set(pageNumbers)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = start;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `p. ${start}` : `pp. ${start}–${end}`);
      start = sorted[i];
      end = start;
    }
  }
  ranges.push(start === end ? `p. ${start}` : `pp. ${start}–${end}`);
  return ranges.join(', ');
}

export const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  sessionPages,
  onDeleteSession
}) => {
  const [filterType, setFilterType] = useState<SessionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group pages by session_id
  const sessionPagesMap = useMemo(() => {
    const map = new Map<string, SessionPage[]>();
    sessionPages.forEach(sp => {
      const list = map.get(sp.session_id) || [];
      list.push(sp);
      map.set(sp.session_id, list);
    });
    return map;
  }, [sessionPages]);

  // Sort sessions newest first
  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sortedSessions.filter(session => {
      if (filterType !== 'all' && session.type !== filterType) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const pages = sessionPagesMap.get(session.id) || [];
        const pageNumbersStr = pages.map(p => p.page_number).join(' ');
        const notesStr = (session.notes || '').toLowerCase();
        const typeStr = session.type.toLowerCase();

        return (
          pageNumbersStr.includes(query) ||
          notesStr.includes(query) ||
          typeStr.includes(query)
        );
      }

      return true;
    });
  }, [sortedSessions, filterType, searchQuery, sessionPagesMap]);

  const handleDelete = async (sessionId: string) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this session log? This will update your touch counts, heatmap, and streaks.'
    );
    if (!confirmDelete) return;

    setDeletingId(sessionId);
    try {
      await onDeleteSession(sessionId);
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const getTypeBadge = (type: SessionType) => {
    switch (type) {
      case 'memorize':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-forest bg-teal-light border border-teal-deep/20 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-teal-deep" />
            <span>Memorization</span>
          </span>
        );
      case 'revise':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-warm bg-amber-light/60 border border-amber-warm/30 px-2.5 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3 text-amber-warm" />
            <span>Revision</span>
          </span>
        );
      case 'recite':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-apricot-muted bg-apricot-light border border-apricot-muted/30 px-2.5 py-0.5 rounded-full">
            <BookMarked className="w-3 h-3 text-apricot-muted" />
            <span>Recitation</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-deep text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">
                Hifz Activity Ledger ({sessions.length} Logged Sessions)
              </h2>
              <p className="text-[11px] text-slate font-medium">
                Inspect, search, and manage recorded study touch logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate hover:text-ink p-1.5 rounded-lg hover:bg-surface-border/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 border-b border-surface-border bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Type Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-surface-border text-xs font-semibold text-slate">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-ink shadow-subtle font-bold'
                    : 'hover:text-ink'
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setFilterType('memorize')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'memorize'
                    ? 'bg-white text-teal-forest shadow-subtle font-bold'
                    : 'hover:text-ink'
                }`}
              >
                Memorize
              </button>
              <button
                onClick={() => setFilterType('revise')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'revise'
                    ? 'bg-white text-amber-warm shadow-subtle font-bold'
                    : 'hover:text-ink'
                }`}
              >
                Revise
              </button>
              <button
                onClick={() => setFilterType('recite')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'recite'
                    ? 'bg-white text-apricot-muted shadow-subtle font-bold'
                    : 'hover:text-ink'
                }`}
              >
                Recite
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search page # or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-teal-deep"
              />
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate space-y-2">
              <BookOpen className="w-8 h-8 text-slate-light mx-auto" />
              <p className="text-xs font-semibold">No activity logs found</p>
              <p className="text-[11px] text-slate-light">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or category filter.'
                  : 'Log a study session from the dashboard to start tracking history.'}
              </p>
            </div>
          ) : (
            filteredSessions.map(session => {
              const pages = sessionPagesMap.get(session.id) || [];
              const pageNums = pages.map(p => p.page_number);
              const stumbledPages = pages.filter(p => p.stumbled).map(p => p.page_number);
              const formattedDate = new Date(session.logged_at).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-surface-border bg-white hover:border-teal-deep/30 transition-all shadow-subtle space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(session.type)}
                      <span className="text-[11px] text-slate font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-light" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deletingId === session.id}
                      className="text-slate hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete session log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Page summary */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-ink font-mono bg-surface px-2.5 py-1 rounded-lg border border-surface-border">
                      {formatPageRanges(pageNums)} ({pageNums.length} {pageNums.length === 1 ? 'page' : 'pages'})
                    </span>

                    {stumbledPages.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-warm bg-amber-light/40 border border-amber-warm/30 px-2 py-0.5 rounded-lg">
                        <AlertTriangle className="w-3 h-3 text-amber-warm shrink-0" />
                        <span>Stumbled on {stumbledPages.length} {stumbledPages.length === 1 ? 'page' : 'pages'} (pp. {stumbledPages.join(', ')})</span>
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <p className="text-xs text-slate italic bg-surface/50 p-2.5 rounded-lg border border-surface-border/60 leading-relaxed">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-border bg-surface/30 flex items-center justify-between text-xs text-slate">
          <span>Showing {filteredSessions.length} of {sessions.length} sessions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-border/60 text-ink font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
