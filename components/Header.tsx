'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalUser, AuthUser } from '../lib/supabase-client';
import { Info, Plus, User, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenLegend: () => void;
  onOpenLogDrawer: () => void;
  totalMemorized: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLegend,
  onOpenLogDrawer,
  totalMemorized
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getLocalUser());
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-border px-3 sm:px-4 py-3 shadow-subtle font-sans">
      <div className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-teal-deep flex items-center justify-center text-white shadow-sm shrink-0 group-hover:bg-teal-forest transition-colors">
              <span className="font-arabic text-xl font-bold leading-none select-none">ر</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-bold text-ink tracking-tight font-sans">
                  RABT <span className="font-arabic text-teal-deep text-base font-semibold mr-1">رَبْط</span>
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-light text-teal-forest border border-teal-deep/15 hidden sm:inline-block">
                  Hifz Retention Engine
                </span>
              </div>
              <p className="text-xs text-slate font-medium">
                Connect what you memorized. Keep it firm. ({totalMemorized} pp.)
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2">
          {/* User Profile Badge */}
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-border/60 border border-surface-border text-xs font-semibold text-ink transition-colors"
            title="Account & Calibration Settings"
          >
            <User className="w-3.5 h-3.5 text-teal-deep" />
            <span className="truncate max-w-[110px]">{user ? user.fullName : 'Learner'}</span>
          </Link>

          <button
            onClick={onOpenLegend}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-slate hover:text-ink hover:bg-surface text-xs font-semibold transition-colors"
            title="Inspect Heuristics & Legend"
          >
            <Info className="w-3.5 h-3.5 text-teal-deep" />
            <span className="hidden sm:inline">Heuristics</span>
          </button>

          <button
            onClick={onOpenLogDrawer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-deep hover:bg-teal-forest text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
