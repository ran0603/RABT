'use client';

import React, { useMemo } from 'react';
import { StudySession, SessionPage, Profile } from '../lib/types';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface ActivityHeatmapProps {
  sessions: StudySession[];
  sessionPages: SessionPage[];
  profile: Profile;
}

const DAYS_TO_SHOW = 365;

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  sessions,
  sessionPages,
  profile
}) => {
  const { maxCount, grid, monthLabels } = useMemo(() => {
    // 1. Calculate the activity counts per day
    const countsByDate = new Map<string, number>();

    sessions.forEach(session => {
      const d = new Date(session.logged_at);
      // Adjust to local time based on the day cutoff hour if necessary, but standard local date is fine for visual heatmap
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${yyyy}-${mm}-${dd}`;

      const pagesInSession = sessionPages.filter(sp => sp.session_id === session.id).length;
      const countToAdd = pagesInSession > 0 ? pagesInSession : 1;

      countsByDate.set(localDateStr, (countsByDate.get(localDateStr) || 0) + countToAdd);
    });

    let maxCount = 0;
    countsByDate.forEach(count => {
      if (count > maxCount) maxCount = count;
    });

    // 2. Generate the calendar grid
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - DAYS_TO_SHOW + 1); // +1 so total days is exactly DAYS_TO_SHOW
    
    // We want the calendar to start on Sunday (or based on profile.week_start_day)
    // For GitHub style, it usually starts on Sunday.
    const startOffset = startDate.getDay();
    const calendarStart = new Date(startDate);
    calendarStart.setDate(startDate.getDate() - startOffset); // Roll back to Sunday

    const gridColumns: Array<Array<{ date: Date; dateStr: string; count: number; inRange: boolean }>> = [];
    const monthLabelsMap = new Map<number, { colIndex: number; label: string }>();

    let currentDate = new Date(calendarStart);
    let colIndex = 0;

    // Loop until we pass 'today' AND reach the end of a week (Saturday)
    while (currentDate <= today || currentDate.getDay() !== 0) {
      if (currentDate.getDay() === 0) {
        gridColumns.push([]);
      }

      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const inRange = currentDate >= startDate && currentDate <= today;
      const count = countsByDate.get(dateStr) || 0;

      gridColumns[gridColumns.length - 1].push({
        date: new Date(currentDate),
        dateStr,
        count,
        inRange
      });

      // Check if this is the first day of a month
      if (currentDate.getDate() === 1 && inRange) {
        monthLabelsMap.set(currentDate.getMonth(), {
          colIndex: gridColumns.length - 1,
          label: currentDate.toLocaleString('default', { month: 'short' })
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() === 0) {
        colIndex++;
      }
    }

    return { 
      maxCount, 
      grid: gridColumns, 
      monthLabels: Array.from(monthLabelsMap.values()) 
    };
  }, [sessions, sessionPages, profile]);

  const getColorClass = (count: number, max: number) => {
    if (count === 0) return 'bg-surface border border-surface-border/50';
    if (count <= 2) return 'bg-teal-light/40 border border-teal-light';
    if (count <= 5) return 'bg-teal-light border border-teal-muted';
    if (count <= 10) return 'bg-teal border border-teal-deep/50';
    return 'bg-teal-deep border border-teal-deep';
  };

  return (
    <section className="bg-white border-b border-surface-border py-4 px-3 sm:px-4">
      <div className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-teal-deep" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate">
            Activity Heatmap (Last Year)
          </h3>
        </div>

        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-border scrollbar-track-transparent">
          <div className="min-w-max">
            {/* Months Header */}
            <div className="flex text-[10px] text-slate-light font-medium mb-1 relative h-4">
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${m.colIndex * 14}px` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {/* Day Labels */}
              <div className="flex flex-col gap-[3px] text-[9px] text-slate-light font-medium pr-2 pb-1 justify-between">
                <span className="mt-2 leading-none">Mon</span>
                <span className="mt-4 leading-none">Wed</span>
                <span className="mt-4 leading-none">Fri</span>
              </div>

              {/* Grid */}
              {grid.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-[3px]">
                  {col.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      title={day.inRange ? `${day.count} pages on ${day.dateStr}` : undefined}
                      className={clsx(
                        'w-[11px] h-[11px] rounded-[2px]',
                        day.inRange ? getColorClass(day.count, maxCount) : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-2 gap-1.5 text-[10px] text-slate-light font-medium">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div className="w-[11px] h-[11px] rounded-[2px] bg-surface border border-surface-border/50" />
                <div className="w-[11px] h-[11px] rounded-[2px] bg-teal-light/40 border border-teal-light" />
                <div className="w-[11px] h-[11px] rounded-[2px] bg-teal-light border border-teal-muted" />
                <div className="w-[11px] h-[11px] rounded-[2px] bg-teal border border-teal-deep/50" />
                <div className="w-[11px] h-[11px] rounded-[2px] bg-teal-deep border border-teal-deep" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
