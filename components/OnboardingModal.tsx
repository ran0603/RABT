'use client';

import React, { useState } from 'react';
import { MushafLayout, Profile } from '../lib/types';
import { Book, Sliders, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (onboardingData: {
    mushaf_layout: MushafLayout;
    default_daily_revision_pages: number;
    stale_warning_days: number;
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [layout, setLayout] = useState<MushafLayout>('madinah_604');
  const [dailyTarget, setDailyTarget] = useState<number>(5);
  const [warningDays, setWarningDays] = useState<number>(14);

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      mushaf_layout: layout,
      default_daily_revision_pages: dailyTarget,
      stale_warning_days: warningDays
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-2xl w-full max-w-lg shadow-modal overflow-hidden">
        {/* Header */}
        <div className="bg-teal-deep text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                {step}/2
              </div>
              <h3 className="text-sm font-bold tracking-tight">
                Calibrate Instrumentation Profile
              </h3>
            </div>
            <span className="text-[11px] text-white/80 font-medium">
              Physical Mushaf & Schedule Setup
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-deep mb-1">
                  <Book className="w-4 h-4 text-teal-deep" />
                  <span>Step 1: Physical Mushaf Layout</span>
                </div>
                <p className="text-xs text-slate">
                  Select your physical Mushaf printing format to calibrate exact page counts and Juz boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {/* Option 1: Madinah 604 */}
                <button
                  type="button"
                  onClick={() => setLayout('madinah_604')}
                  className={clsx(
                    'p-4 rounded-xl border text-left flex items-start justify-between transition-all',
                    layout === 'madinah_604'
                      ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                      : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                  )}
                >
                  <div>
                    <div className="text-sm font-bold text-ink">
                      Madinah Mushaf (604 Pages)
                    </div>
                    <div className="text-xs text-slate mt-0.5">
                      Standard 15-line King Fahd Mushaf pagination.
                    </div>
                  </div>
                  {layout === 'madinah_604' && (
                    <CheckCircle2 className="w-5 h-5 text-teal-deep shrink-0 mt-0.5" />
                  )}
                </button>

                {/* Option 2: Indo-Pak 848 */}
                <button
                  type="button"
                  onClick={() => setLayout('indopak_848')}
                  className={clsx(
                    'p-4 rounded-xl border text-left flex items-start justify-between transition-all',
                    layout === 'indopak_848'
                      ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                      : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                  )}
                >
                  <div>
                    <div className="text-sm font-bold text-ink">
                      Indo-Pak / South Asian (848 Pages)
                    </div>
                    <div className="text-xs text-slate mt-0.5">
                      Standard 16-line South Asian Mushaf pagination & Juz bounds.
                    </div>
                  </div>
                  {layout === 'indopak_848' && (
                    <CheckCircle2 className="w-5 h-5 text-teal-deep shrink-0 mt-0.5" />
                  )}
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-forest transition-colors shadow-sm"
                >
                  <span>Continue to Cadence</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-deep mb-1">
                  <Sliders className="w-4 h-4 text-teal-deep" />
                  <span>Step 2: Revision Cadence & Warning Threshold</span>
                </div>
                <p className="text-xs text-slate">
                  Calibrate your target revision volume and decay early-warning sensitivity.
                </p>
              </div>

              {/* Target Daily Volume */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                  Target Daily Revision Volume (Pages)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={dailyTarget}
                  onChange={e => setDailyTarget(Number(e.target.value))}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
              </div>

              {/* Initial Staleness Warning Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate">
                  <span>Staleness Warning Threshold</span>
                  <span className="text-teal-deep font-mono">{warningDays} Days</span>
                </div>
                <input
                  type="range"
                  min={7}
                  max={30}
                  value={warningDays}
                  onChange={e => setWarningDays(Number(e.target.value))}
                  className="w-full accent-teal-deep cursor-pointer"
                />
                <p className="text-[11px] text-slate-light">
                  Pages untouched for &gt;{warningDays} days will shift to Cooling state.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-border text-xs font-semibold text-slate hover:bg-surface transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-forest transition-colors shadow-sm"
                >
                  <span>Confirm Profile Calibration</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
