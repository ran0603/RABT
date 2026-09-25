'use client';

import React, { useRef } from 'react';
import { JuzMeta } from '../lib/types';
import { AlertCircle, Layers } from 'lucide-react';
import { clsx } from 'clsx';

interface JuzMacroStripProps {
  juzList: JuzMeta[];
  selectedJuz: number | null; // null means 'All Pages'
  onSelectJuz: (juzNumber: number | null) => void;
}

export const JuzMacroStrip: React.FC<JuzMacroStripProps> = ({
  juzList,
  selectedJuz,
  onSelectJuz
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalPages = juzList.length > 0 ? juzList[juzList.length - 1].endPage : 604;

  return (
    <section className="bg-white border-b border-surface-border py-3 px-3 sm:px-4 select-none">
      <div className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-teal-deep" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate">
              Macro Navigation — 30 Juz
            </h2>
          </div>
          <span className="text-[11px] text-slate-light">
            Swipe horizontal • Amber dot = &gt;25d stale
          </span>
        </div>

        {/* Horizontal Scroll Strip */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-surface-border scroll-smooth"
        >
          {/* All Pages Card */}
          <button
            onClick={() => onSelectJuz(null)}
            className={clsx(
              'flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all min-w-[100px]',
              selectedJuz === null
                ? 'bg-teal-deep text-white border-teal-deep shadow-sm font-semibold'
                : 'bg-surface hover:bg-surface-border/60 text-ink border-surface-border'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">All {totalPages}</span>
            </div>
            <div className="text-[10px] opacity-85 mt-0.5 font-medium">
              Full Canvas
            </div>
          </button>

          {/* 30 Juz Cards */}
          {juzList.map(j => {
            const isSelected = selectedJuz === j.juzNumber;
            const isPartial = j.totalMemorized > 0 && j.totalMemorized < (j.endPage - j.startPage + 1);
            const isComplete = j.totalMemorized === (j.endPage - j.startPage + 1);

            return (
              <button
                key={j.juzNumber}
                onClick={() => onSelectJuz(j.juzNumber)}
                className={clsx(
                  'flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all relative min-w-[110px]',
                  isSelected
                    ? 'bg-teal-deep text-white border-teal-deep shadow-sm font-semibold'
                    : j.hasCriticalStaleness
                    ? 'bg-apricot-light/60 border-apricot-muted/40 text-ink hover:bg-apricot-light'
                    : isComplete
                    ? 'bg-sage-light/60 border-sage/30 text-ink hover:bg-sage-light'
                    : isPartial
                    ? 'bg-white border-surface-border text-ink hover:bg-surface'
                    : 'bg-surface/50 border-surface-border/60 text-slate hover:bg-surface'
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold tracking-tight">
                    Juz {j.juzNumber}
                  </span>

                  {/* Restrained Alert Indicator for >25 days staleness */}
                  {j.hasCriticalStaleness && (
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full inline-block shrink-0',
                        isSelected ? 'bg-apricot-muted ring-2 ring-white/30' : 'bg-apricot-muted'
                      )}
                      title={`Contains pages untouched for ${j.maxStalenessDays} days (>25d stale)`}
                    />
                  )}
                </div>

                <div className="text-[10px] mt-1 opacity-90 font-medium">
                  <span className={clsx(isSelected ? 'text-white' : 'text-slate-light')}>
                    {j.totalMemorized}/{j.endPage - j.startPage + 1}
                  </span>
                  <span>pp. {j.startPage}–{j.endPage}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
