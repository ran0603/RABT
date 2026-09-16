'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, setLocalUser, generateValidUUID } from '../lib/supabase-client';
import { Mail, Lock, User, ShieldCheck, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface WelcomeAuthScreenProps {
  onAuthenticated: () => void;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [weekStartDay, setWeekStartDay] = useState<number>(0); // Sunday
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
          }
          if (data.user) {
            setLocalUser({
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || email.split('@')[0]
            });
            setSuccessMessage('Authenticated. Welcome back to RABT.');
            setTimeout(() => onAuthenticated(), 500);
            return;
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                week_start_day: weekStartDay
              }
            }
          });
          if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
          }
          if (data.user) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName,
              week_start_day: weekStartDay
            });
            setSuccessMessage('Account registered successfully! Please sign in with your email and password to continue.');
            setMode('login');
            setLoading(false);
            return;
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication error occurred.');
        setLoading(false);
        return;
      }
    }

    if (mode === 'register') {
      setSuccessMessage('Account registered successfully! Please sign in with your email and password to continue.');
      setMode('login');
      setLoading(false);
      return;
    }

    // Local-first demo login fallback
    const validId = generateValidUUID();
    setLocalUser({
      id: validId,
      email: email || 'learner@rabt.app',
      fullName: email ? email.split('@')[0] : 'Hifz Learner'
    });
    setSuccessMessage('Authenticated for RABT ledger session.');
    setTimeout(() => onAuthenticated(), 500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-teal-deep flex items-center justify-center text-white shadow-card">
            <span className="font-arabic text-2xl font-bold leading-none select-none">ر</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              RABT <span className="font-arabic text-teal-deep text-xl font-semibold mr-1">رَبْط</span>
            </h1>
            <p className="text-xs text-slate font-medium">
              Hifz Early-Warning Retention Engine
            </p>
          </div>
        </div>

        <p className="text-xs text-slate mt-2 italic font-serif">
          “Connect what you memorized. Keep it firm.”
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-surface-border py-8 px-6 shadow-modal rounded-2xl sm:px-10">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-xl mb-6 border border-surface-border">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={clsx(
                'py-2 text-xs font-bold rounded-lg transition-all',
                mode === 'login'
                  ? 'bg-white text-teal-deep shadow-subtle'
                  : 'text-slate hover:text-ink'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={clsx(
                'py-2 text-xs font-bold rounded-lg transition-all',
                mode === 'register'
                  ? 'bg-white text-teal-deep shadow-subtle'
                  : 'text-slate hover:text-ink'
              )}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-apricot-light border border-apricot-muted/30 text-apricot-muted text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-sage-light border border-sage/40 text-teal-forest text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name (Registration only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Abdallah Al-Mansoor"
                    className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hifz.learner@example.com"
                  className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
              </div>
            </div>

            {/* Confirm Password (Registration only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                  />
                </div>
              </div>
            )}

            {/* Week Start Selector (Registration only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-deep" />
                  <span>Week Start Day</span>
                </label>
                <select
                  value={weekStartDay}
                  onChange={e => setWeekStartDay(Number(e.target.value))}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                >
                  <option value={0}>Sunday (RABT Default)</option>
                  <option value={1}>Monday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-deep hover:bg-teal-forest shadow-sm transition-all focus:outline-none disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Ledger' : 'Create Hifz Record'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Dignity Footer Note */}
        <div className="mt-6 text-center text-[11px] text-slate-light flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-deep" />
          <span>Dignified instrumentation • No gamification • Inspectable retention data</span>
        </div>
      </div>
    </div>
  );
};
