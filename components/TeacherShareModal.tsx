'use client';

import React, { useState } from 'react';
import { Profile, SessionType, ActivityStreak } from '../lib/types';
import { X, Share2, Copy, Check, MessageSquare, BookOpen, Flame, Award } from 'lucide-react';

interface TeacherShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  totalMemorized: number;
  streaks: Record<SessionType, ActivityStreak>;
}

export const TeacherShareModal: React.FC<TeacherShareModalProps> = ({
  isOpen,
  onClose,
  profile,
  totalMemorized,
  streaks
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalPages = profile.mushaf_layout === 'indopak_848' ? 848 : 604;
  const learnerName = profile.full_name || 'Hifz Learner';

  // Build report text
  const shareText = `📖 Hifz Progress Update — RABT (رَبْط)
Learner: ${learnerName}
Total Memorized: ${totalMemorized} / ${totalPages} pages

🔥 Current Streaks:
• Memorization: ${streaks.memorize?.currentStreak || 0} days
• Revision: ${streaks.revise?.currentStreak || 0} days
• Recitation: ${streaks.recite?.currentStreak || 0} days

Daily Revision Target: ${profile.default_daily_revision_pages || 5} pages/day
"Connect what you memorized. Keep it firm." 🤲`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-surface-border rounded-2xl w-full max-w-md shadow-modal overflow-hidden">
        {/* Header */}
        <div className="bg-teal-deep text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-light" />
            <h3 className="text-sm font-bold">Share Progress with Teacher / Circle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-slate">
            Send a formatted report of your Hifz status to your Ustadz, teacher, or study circle via WhatsApp or text.
          </p>

          {/* Visual Preview Card */}
          <div className="bg-surface border border-surface-border rounded-xl p-3.5 space-y-2.5 font-sans">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-deep text-white flex items-center justify-center font-arabic text-sm font-bold">
                  ر
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">{learnerName}</div>
                  <div className="text-[10px] text-slate">RABT Hifz Status Report</div>
                </div>
              </div>
              <span className="bg-teal-light text-teal-forest px-2 py-0.5 rounded text-[10px] font-bold">
                {totalMemorized} / {totalPages} pp.
              </span>
            </div>

            {/* Streaks Preview */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white p-2 rounded-lg border border-surface-border">
                <div className="text-[10px] text-slate font-medium">Memorize</div>
                <div className="text-xs font-bold text-ink flex items-center justify-center gap-0.5 mt-0.5">
                  <Flame className="w-3 h-3 text-amber-warm" />
                  <span>{streaks.memorize?.currentStreak || 0}d</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-surface-border">
                <div className="text-[10px] text-slate font-medium">Revise</div>
                <div className="text-xs font-bold text-ink flex items-center justify-center gap-0.5 mt-0.5">
                  <Flame className="w-3 h-3 text-teal-deep" />
                  <span>{streaks.revise?.currentStreak || 0}d</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-surface-border">
                <div className="text-[10px] text-slate font-medium">Recite</div>
                <div className="text-xs font-bold text-ink flex items-center justify-center gap-0.5 mt-0.5">
                  <Flame className="w-3 h-3 text-sage-dark" />
                  <span>{streaks.recite?.currentStreak || 0}d</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Report!' : 'Copy Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
