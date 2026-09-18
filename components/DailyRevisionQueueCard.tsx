'use client';

import React from 'react';
import { DailyQueueRecommendation } from '../lib/types';
import { Play, Sparkles, Clock, AlertTriangle, BookOpen } from 'lucide-react';

interface DailyRevisionQueueCardProps {
  queue: DailyQueueRecommendation | null;
  onSelectQueuePages: (pages: number[]) => void;
}

export const DailyRevisionQueueCard: React.FC<DailyRevisionQueueCardProps> = ({
  queue,
  onSelectQueuePages
}) => {
  if (!queue || queue.pages.length === 0) return null;

  const firstPage = queue.pages[0];

  return (
    <section className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto px-3 sm:px-4 pt-4 pb-2">
      <div className="bg-gradient-to-r from-teal-deep to-teal-forest text-white rounded-2xl p-4 sm:p-5 shadow-modal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Column: Info & Queue Badge */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-warm" />
              <span>Today's Automated Review Queue</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/80 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>~{queue.estimatedMinutes} mins</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {queue.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
            <span>{queue.reasonSummary}</span>
            {queue.stumbledCount > 0 && (
              <span className="flex items-center gap-1 bg-apricot-muted/30 px-2 py-0.5 rounded text-[10px] font-bold text-apricot-light border border-apricot-muted/40">
                <AlertTriangle className="w-3 h-3" />
                <span>{queue.stumbledCount} Stumbled Flagged</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Actions: CTA Buttons */}
          <button
            onClick={() => onSelectQueuePages(queue.pages)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-deep font-bold text-xs sm:text-sm hover:bg-surface shadow-md transition-all shrink-0 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-teal-deep" />
            <span>Start Review ({queue.pages.length} pp.)</span>
          </button>
      </div>
    </section>
  );
};
