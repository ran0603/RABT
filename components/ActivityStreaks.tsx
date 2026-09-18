'use client';

import React from 'react';
import { ActivityStreak, SessionType } from '../lib/types';
import { BookOpen, Repeat, Mic, ShieldCheck, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface ActivityStreaksProps {
  streaks: Record<SessionType, ActivityStreak>;
  onFilterType?: (type: SessionType) => void;
}

export const ActivityStreaks: React.FC<ActivityStreaksProps> = ({ streaks }) => {
  const items: Array<{ type: SessionType; icon: React.ReactNode; desc: string }> = [
    {
      type: 'memorize',
      icon: <BookOpen className="w-4 h-4 text-teal-deep" />,
      desc: 'Hifz — New pages acquired'
    },
    {
      type: 'revise',
      icon: <Repeat className="w-4 h-4 text-amber-warm" />,
      desc: 'Murājaʿah — Systematic review'
    },
    {
      type: 'recite',
      icon: <Mic className="w-4 h-4 text-sage-dark" />,
      desc: 'Tilāwah — Testing & recitation'
    }
  ];

  return (
    <section className="bg-white border-b border-surface-border py-3 px-3 sm:px-4">
      <div className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-deep" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate">
              Independent Activity Continuity (Week Start: Sunday)
            </h3>
          </div>
          <span className="text-[11px] text-slate-light font-medium">
            Streak survives if logged Today or Yesterday
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {items.map(item => {
            const streak = streaks[item.type];
            const isAlive = streak?.isAlive ?? false;
            const currentCount = streak?.currentStreak ?? 0;

            return (
              <div
                key={item.type}
                className={clsx(
                  'p-3 rounded-xl border transition-all flex items-center justify-between',
                  isAlive
                    ? 'bg-surface/70 border-surface-border text-ink'
                    : 'bg-surface/30 border-surface-border/60 text-slate'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-surface-border shadow-subtle">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>{streak.label}</span>
                      {isAlive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sage" title="Streak active" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={clsx(
                    'text-base font-bold font-mono tracking-tight',
                    isAlive ? 'text-teal-deep' : 'text-slate-light'
                  )}>
                    {currentCount}d
                  </div>
                  <div className="text-[10px] text-slate-light font-medium">
                    {streak.loggedToday ? 'Logged today' : streak.loggedYesterday ? 'Yesterday' : 'Inactive'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
