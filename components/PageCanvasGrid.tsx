'use client';

import React, { useState, useRef } from 'react';
import { PageRetentionState } from '../lib/types';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';

interface PageCanvasGridProps {
  pages: PageRetentionState[];
  selectedPageNumbers: Set<number>;
  stumbledStagingPages: Set<number>;
  onSelectPages: (pageNumbers: number[]) => void;
  onInspectPage: (page: PageRetentionState) => void;
  onToggleStumbleStaging: (pageNumber: number) => void;
}

export const PageCanvasGrid: React.FC<PageCanvasGridProps> = ({
  pages,
  selectedPageNumbers,
  stumbledStagingPages,
  onSelectPages,
  onInspectPage,
  onToggleStumbleStaging
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubStartPage, setScrubStartPage] = useState<number | null>(null);

  // Handle Scrub Drag Start
  const handlePointerDown = (pageNum: number, e: React.PointerEvent) => {
    // If double tap or shift key, handle special actions
    if (e.detail === 2) {
      onToggleStumbleStaging(pageNum);
      return;
    }

    setIsScrubbing(true);
    setScrubStartPage(pageNum);

    if (e.shiftKey && scrubStartPage !== null) {
      // Range select from scrubStartPage to pageNum
      const start = Math.min(scrubStartPage, pageNum);
      const end = Math.max(scrubStartPage, pageNum);
      const rangePages: number[] = [];
      for (let p = start; p <= end; p++) rangePages.push(p);
      onSelectPages(rangePages);
    } else {
      onSelectPages([pageNum]);
    }
  };

  // Handle Scrub Drag Hover
  const handlePointerEnter = (pageNum: number) => {
    if (isScrubbing && scrubStartPage !== null) {
      const start = Math.min(scrubStartPage, pageNum);
      const end = Math.max(scrubStartPage, pageNum);
      const rangePages: number[] = [];
      for (let p = start; p <= end; p++) rangePages.push(p);
      onSelectPages(rangePages);
    }
  };

  // Handle Pointer Up anywhere
  const handlePointerUp = () => {
    setIsScrubbing(false);
  };

  return (
    <div
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="w-full select-none"
    >
      <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-15 gap-1.5 sm:gap-2">
        {pages.map((p, idx) => {
          const isSelected = selectedPageNumbers.has(p.pageNumber);
          const isStumbledStaging = stumbledStagingPages.has(p.pageNumber);
          const isStumbledInRecord = p.stumbled;

          // Check if this page starts a new Surah
          const isNewSurah = idx === 0 || pages[idx - 1].surahName !== p.surahName;

          // Determine styling
          let baseBg = 'bg-white border-surface-border text-slate';
          let borderStyle = 'border-surface-border';
          let opacityStyle = 'opacity-100';

          if (!p.isMemorized) {
            baseBg = 'bg-surface/30 border-dashed border-surface-border text-slate-light/70';
          } else {
            if (p.totalTouches === 0 || p.masteryLevel === 'sand') {
              baseBg = 'bg-amber-light/30 text-ink';
              borderStyle = 'border-amber-warm/40';
            } else if (p.masteryLevel === 'amber') {
              baseBg = 'bg-amber-warm/15 text-ink';
              borderStyle = 'border-amber-warm/60';
            } else if (p.masteryLevel === 'sage') {
              baseBg = 'bg-sage-light text-teal-forest';
              borderStyle = 'border-sage/60';
            }

            if (p.decayLevel === 'cooling') {
              opacityStyle = 'opacity-80 saturate-70';
            } else if (p.decayLevel === 'decaying') {
              opacityStyle = 'opacity-60 saturate-40 bg-slate-faint text-slate';
              borderStyle = 'border-slate/30';
            }
          }

          return (
            <React.Fragment key={p.pageNumber}>
              {isNewSurah && (
                <div className="col-span-full pt-3 pb-1 flex items-center gap-2 border-b border-surface-border/60 mb-1 mt-2 first:mt-0">
                  <span className="text-xs font-bold text-teal-deep bg-teal-light/50 px-2.5 py-0.5 rounded-lg border border-teal-deep/20">
                    Surah {p.surahName}
                  </span>
                  <span className="text-[11px] text-slate font-medium">
                    Juz {p.juzNumber}
                  </span>
                </div>
              )}

              <div
                onPointerDown={(e) => handlePointerDown(p.pageNumber, e)}
                onPointerEnter={() => handlePointerEnter(p.pageNumber)}
                className={clsx(
                  'relative flex flex-col justify-between p-2 rounded-xl border transition-all cursor-pointer min-h-[58px] min-w-[52px]',
                  baseBg,
                  borderStyle,
                  opacityStyle,
                  isSelected && 'ring-2 ring-teal-deep ring-offset-1 z-10 shadow-md font-bold scale-[1.02]',
                  (isStumbledInRecord || isStumbledStaging) && 'ring-2 ring-apricot-muted border-apricot-muted'
                )}
              >
                {/* Top Row: Page number and status badge */}
                <div className="flex items-center justify-between gap-0.5">
                  <span className="text-xs font-bold font-sans tracking-tight">
                    {p.pageNumber}
                  </span>

                  {/* Stumble Flagging Indicator */}
                  {(isStumbledInRecord || isStumbledStaging) ? (
                    <span
                      className="flex items-center text-apricot-muted"
                      title="Stumbled — priority re-testing scheduled"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 fill-apricot-light" />
                    </span>
                  ) : p.isMemorized && (
                    <span className="text-[10px] font-semibold opacity-70">
                      {p.totalTouches}t
                    </span>
                  )}
                </div>

                {/* Bottom Row: Surah abbreviation & Days unrevised indicator */}
                <div className="mt-1 flex items-center justify-between text-[10px] font-medium opacity-80">
                  <span className="truncate max-w-[42px] text-[9px] font-semibold text-slate">
                    {p.surahName.replace('Al-', '').replace('An-', '')}
                  </span>
                  {p.isMemorized && p.daysSinceTouch !== null && (
                    <span className={clsx(
                      'font-mono text-[9px] px-1 rounded',
                      p.daysSinceTouch > 25 ? 'bg-apricot-light text-apricot-muted font-bold' : 'text-slate'
                    )}>
                      {p.daysSinceTouch}d
                    </span>
                  )}
                </div>

                {/* Inspect Button Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectPage(p);
                  }}
                  className="absolute top-1 right-1 p-0.5 rounded text-slate-light opacity-0 hover:opacity-100 hover:text-teal-deep transition-opacity"
                  title="Inspect Page Details"
                >
                  <Bookmark className="w-3 h-3" />
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
