'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getLocalUser } from '../lib/supabase-client';
import { MailWarning, Check, Send, AlertCircle, RefreshCw } from 'lucide-react';

export const EmailVerificationAlert: React.FC = () => {
  const [isUnverified, setIsUnverified] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    const localUser = getLocalUser();
    if (!localUser) return;

    setUserEmail(localUser.email);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || localUser.email);
          // If confirmed_at or email_confirmed_at is missing, email is unverified
          const confirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
          setIsUnverified(!confirmed);
          return;
        }
      } catch (e) {
        // fallback
      }
    }

    // Default for demo or unconfirmed local sessions
    setIsUnverified(true);
  };

  const handleResendEmail = async () => {
    if (!userEmail) return;
    setSending(true);
    setSentMessage(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: userEmail
        });
        if (error) {
          setSentMessage(`Error: ${error.message}`);
        } else {
          setSentMessage('Verification link sent! Please check your email inbox.');
        }
      } catch (err: any) {
        setSentMessage(err.message || 'Failed to resend email.');
      }
    } else {
      setSentMessage('Verification email simulated for demo session.');
    }
    setSending(false);
  };

  if (!isUnverified) return null;

  return (
    <div className="bg-amber-light/80 border-b border-amber-warm/30 px-4 py-2.5 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-ink">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-amber-warm/20 text-amber-warm shrink-0">
            <MailWarning className="w-4 h-4 text-amber-warm" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-ink mr-1">Email Unverified:</span>
            <span className="text-slate">
              For your Hifz retention records to be retained across all your devices, please verify your email address.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {sentMessage ? (
            <span className="text-[11px] font-semibold text-teal-forest flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-sage/30">
              <Check className="w-3.5 h-3.5 text-sage" />
              <span>{sentMessage}</span>
            </span>
          ) : (
            <button
              onClick={handleResendEmail}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-amber-warm/40 hover:bg-amber-light text-xs font-semibold text-ink shadow-subtle transition-all disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-warm" />
              ) : (
                <Send className="w-3.5 h-3.5 text-amber-warm" />
              )}
              <span>Resend Link</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
