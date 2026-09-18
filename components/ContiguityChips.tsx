'use client';

import React from 'react';
import { ContiguousCluster } from '../lib/types';
import { Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface ContiguityChipsProps {
  clusters: ContiguousCluster[];
  onSelectCluster: (pages: number[]) => void;
}

export const ContiguityChips: React.FC<ContiguityChipsProps> = ({
  clusters,
  onSelectCluster
}) => {
  if (clusters.length === 0) return null;

  return (
    <section className="bg-surface/60 border-y border-surface-border py-3 px-3 sm:px-4">
      <div className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-apricot-muted" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Suggested Review Chunks
            </h3>
          </div>
          <span className="text-[11px] text-slate-light font-medium hidden sm:inline">
            Smart suggestions based on your revision history
          </span>
        </div>

        {/* Chips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {clusters.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => onSelectCluster(c.pages)}
              className="flex flex-col justify-between p-2.5 rounded-xl border border-surface-border bg-white hover:border-teal-deep/50 hover:shadow-subtle transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-ink group-hover:text-teal-deep transition-colors">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate mt-0.5">
                    pp. {c.startPage}–{c.endPage} ({c.pages.length} pp.)
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-apricot-light px-2 py-0.5 rounded-md text-apricot-muted text-[10px] font-bold shrink-0 border border-apricot-muted/20">
                  <Clock className="w-3 h-3" />
                  <span>{c.averageDaysStale}d unrevised</span>
                </div>
              </div>

              {c.stumbledPagesCount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-apricot-muted">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{c.stumbledPagesCount} stumbled page(s) flagged</span>
                </div>
              )}

              <div className="mt-2 pt-1.5 border-t border-surface-border/50 flex items-center justify-between text-[10px] text-teal-deep font-semibold">
                <span>Quick-fill range</span>
                <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
