'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { globalStore } from '../../lib/store';
import { Profile, MushafLayout } from '../../lib/types';
import { getLocalUser, setLocalUser, AuthUser } from '../../lib/supabase-client';
import {
  ArrowLeft,
  Sliders,
  Book,
  Clock,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Trash2,
  ShieldCheck,
  Download,
  Upload,
  FileJson,
  Database,
  Check,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(globalStore.getProfile());
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Import/Export State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedFilePayload, setImportedFilePayload] = useState<any>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [importStatusNotice, setImportStatusNotice] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setProfile(globalStore.getProfile());
    setAuthUser(getLocalUser());
  }, []);

  const handleExportData = () => {
    const data = globalStore.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rabt-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('File does not contain a valid JSON object.');
        }

        if (!Array.isArray(parsed.memorizedPages) && !Array.isArray(parsed.sessions)) {
          throw new Error('JSON structure does not match a valid RABT backup dataset.');
        }

        setImportedFilePayload(parsed);
        setImportModalOpen(true);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!importedFilePayload) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await globalStore.importData(importedFilePayload, importMode);
      if (res.success) {
        setImportStatusNotice(
          `Successfully imported dataset (${res.counts.memorized} memorized pages, ${res.counts.sessions} study sessions).`
        );
        setTimeout(() => setImportStatusNotice(null), 5000);
        setImportModalOpen(false);
        setImportedFilePayload(null);
        setProfile(globalStore.getProfile());
      } else {
        setImportError(res.message);
      }
    } catch (err: any) {
      setImportError(err.message || 'Failed to import data.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveProfile = (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    globalStore.updateProfile(updates);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSignOut = () => {
    setLocalUser(null);
    setAuthUser(null);
    router.push('/login');
  };

  const handleClearLedgerData = async () => {
    const confirmFirst = confirm(
      '⚠️ DANGER: Are you sure you want to clear all your Hifz ledger data?'
    );
    if (!confirmFirst) return;

    const confirmSecond = confirm(
      'FINAL WARNING: This will permanently erase ALL logged study sessions, revision history, and memorization records from local storage AND Supabase. Type OK to proceed.'
    );
    if (confirmSecond) {
      await globalStore.clearToEmptyData();
      alert('All ledger data has been permanently cleared locally and on Supabase.');
      router.push('/');
    }
  };

  const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Riyadh',
    'Asia/Dubai',
    'Asia/Jakarta',
    'Asia/Karachi',
    'Asia/Kuala_Lumpur',
    'Australia/Sydney'
  ];

  return (
    <main className="min-h-screen bg-white text-ink pb-20 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-surface-border px-4 py-3 shadow-subtle">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-ink">
              RABT Settings & Calibration
            </h1>
            {savedNotice && (
              <span className="text-[11px] font-semibold text-teal-forest bg-sage-light px-2 py-0.5 rounded-full border border-sage/30 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3 text-sage" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Section 1: Instrumentation Calibration */}
        <section className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Sliders className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. Instrumentation Calibration
            </h2>
          </div>

          <div className="space-y-4">
            {/* Warning Staleness Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate">
                <span>Warning Staleness Threshold</span>
                <span className="text-teal-deep font-mono">{profile.stale_warning_days} Days</span>
              </div>
              <input
                type="range"
                min={7}
                max={30}
                value={profile.stale_warning_days}
                onChange={e => handleSaveProfile({ stale_warning_days: Number(e.target.value) })}
                className="w-full accent-teal-deep cursor-pointer"
              />
              <p className="text-[11px] text-slate-light">
                Pages untouched beyond {profile.stale_warning_days} days shift to Cooling state.
              </p>
            </div>

            {/* Critical Staleness Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate">
                <span>Critical Staleness Threshold</span>
                <span className="text-apricot-muted font-mono">{profile.stale_critical_days} Days</span>
              </div>
              <input
                type="range"
                min={14}
                max={60}
                value={profile.stale_critical_days}
                onChange={e => handleSaveProfile({ stale_critical_days: Number(e.target.value) })}
                className="w-full accent-apricot-muted cursor-pointer"
              />
              <p className="text-[11px] text-slate-light">
                Pages untouched beyond {profile.stale_critical_days} days trigger critical staleness alert badges on Juz cards.
              </p>
            </div>

            {/* Target Daily Revision Volume */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                Target Daily Revision Volume (Pages)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={profile.default_daily_revision_pages}
                onChange={e => handleSaveProfile({ default_daily_revision_pages: Number(e.target.value) })}
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Display & Layout */}
        <section className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Book className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. Display & Physical Mushaf Layout
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate">
              Physical Mushaf Format
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Madinah 604 */}
              <button
                type="button"
                onClick={() => handleSaveProfile({ mushaf_layout: 'madinah_604' })}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  profile.mushaf_layout === 'madinah_604'
                    ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                    : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-ink">Madinah Mushaf (604 Pages)</div>
                  <div className="text-[11px] text-slate mt-1">
                    Standard 15-line King Fahd Mushaf pagination & Juz boundaries.
                  </div>
                </div>
              </button>

              {/* Option 2: Indo-Pak 848 */}
              <button
                type="button"
                onClick={() => handleSaveProfile({ mushaf_layout: 'indopak_848' })}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  profile.mushaf_layout === 'indopak_848'
                    ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                    : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-ink">Indo-Pak / South Asian (848 Pages)</div>
                  <div className="text-[11px] text-slate mt-1">
                    Standard 16-line South Asian Mushaf pagination & Juz boundaries.
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-light/30 border border-amber-warm/30 text-ink text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-warm shrink-0 mt-0.5" />
              <span>
                Changing Mushaf printing layout updates total page bounds and recalculates Juz range grids across the canvas.
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Schedule & Time Boundary */}
        <section className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Clock className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. Schedule & Day-Cutoff Roll-Over
            </h2>
          </div>

          <div className="space-y-4">
            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                Timezone Configuration
              </label>
              <select
                value={profile.timezone}
                onChange={e => handleSaveProfile({ timezone: e.target.value })}
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
              >
                {timezoneOptions.map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {/* Day Roll-Over Cutoff Hour */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                Day Roll-Over Cutoff Hour
              </label>
              <select
                value={profile.day_cutoff_hour}
                onChange={e => handleSaveProfile({ day_cutoff_hour: Number(e.target.value) })}
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
              >
                <option value={0}>Midnight (12:00 AM)</option>
                <option value={2}>2:00 AM Cutoff</option>
                <option value={3}>3:00 AM Cutoff (RABT Default)</option>
                <option value={4}>4:00 AM Cutoff</option>
              </select>
              <p className="text-[11px] text-slate-light">
                Sessions logged between 12:00 AM and {profile.day_cutoff_hour}:00 AM count toward the previous calendar day, preserving streak continuity for late-night reciters.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Account & Sign Out */}
        <section className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <User className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Account & Authentication
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-ink">
                {authUser ? authUser.fullName : profile.full_name || 'Hifz Learner'}
              </div>
              <div className="text-xs text-slate">
                {authUser ? authUser.email : 'Local Session Ledger'}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-surface-border hover:bg-surface-border/60 text-slate hover:text-ink text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-apricot-muted" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>

        {/* Section 5: Data Backup & Migration (Export / Import JSON) */}
        <section className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Database className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              5. Data Backup & Migration (JSON)
            </h2>
          </div>

          <p className="text-xs text-slate leading-relaxed">
            Export your complete Hifz memorization ledger, revision session history, and calibration settings to a JSON backup file, or import data from a file.
          </p>

          {importStatusNotice && (
            <div className="p-3.5 rounded-xl bg-teal-light/50 border border-teal-deep/30 text-teal-forest text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0" />
              <span>{importStatusNotice}</span>
            </div>
          )}

          {importError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Export Button */}
            <div className="p-4 rounded-xl bg-surface/50 border border-surface-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <FileJson className="w-4 h-4 text-teal-deep" />
                  <span>Export Data (JSON)</span>
                </div>
                <p className="text-[11px] text-slate mt-1.5 leading-relaxed">
                  Download a complete backup copy of your RABT database in clean JSON format.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            {/* Import Button & Picker */}
            <div className="p-4 rounded-xl bg-surface/50 border border-surface-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <Upload className="w-4 h-4 text-teal-deep" />
                  <span>Import Data (JSON)</span>
                </div>
                <p className="text-[11px] text-slate mt-1.5 leading-relaxed">
                  Restore or merge your Hifz ledger and study sessions from a JSON backup file.
                </p>
              </div>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-teal-deep/30 hover:bg-teal-light/20 text-teal-deep text-xs font-bold transition-all cursor-pointer shadow-subtle active:scale-[0.98]">
                <Upload className="w-4 h-4" />
                <span>Select JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Section 6: Danger Zone — Data Reset */}
        <section className="bg-red-50/30 border border-red-200 rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-red-200 pb-3">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-red-800 uppercase tracking-wider">
              6. Danger Zone — Data Reset
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-red-700 leading-relaxed">
              Clearing ledger data permanently erases all logged study sessions, revision touch counts, stumbled page flags, and memorization records. <strong>This action cannot be undone.</strong>
            </p>

            <button
              type="button"
              onClick={handleClearLedgerData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Ledger Data</span>
            </button>
          </div>
        </section>

        {/* Dignity Footer */}
        <div className="text-center text-xs text-slate-light flex items-center justify-center gap-1.5 py-2">
          <ShieldCheck className="w-4 h-4 text-teal-deep" />
          <span>RABT — Precision instrument for Hifz retention calibration</span>
        </div>
      </div>

      {/* Import Confirmation Modal */}
      {importModalOpen && importedFilePayload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-ink">
                <FileJson className="w-5 h-5 text-teal-deep" />
                <span>Confirm JSON Data Import</span>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate hover:text-ink p-1 rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary of items in file */}
            <div className="bg-surface/60 rounded-xl p-3.5 space-y-2 border border-surface-border text-xs">
              <div className="text-slate font-semibold truncate">
                File: <span className="text-ink font-mono">{importFileName}</span>
              </div>
              {importedFilePayload.exportedAt && (
                <div className="text-slate text-[11px]">
                  Exported on: {new Date(importedFilePayload.exportedAt).toLocaleString()}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-border text-slate">
                <div className="bg-white p-2.5 rounded-lg border border-surface-border">
                  <span className="block text-[10px] text-slate-light font-bold uppercase">Memorized Pages</span>
                  <span className="text-sm font-bold text-teal-deep font-mono">
                    {Array.isArray(importedFilePayload.memorizedPages) ? importedFilePayload.memorizedPages.length : 0}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-surface-border">
                  <span className="block text-[10px] text-slate-light font-bold uppercase">Study Sessions</span>
                  <span className="text-sm font-bold text-teal-deep font-mono">
                    {Array.isArray(importedFilePayload.sessions) ? importedFilePayload.sessions.length : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate">
                Select Import Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    importMode === 'merge'
                      ? 'bg-teal-light/40 border-teal-deep text-ink font-semibold ring-1 ring-teal-deep'
                      : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                  }`}
                >
                  <div className="text-xs font-bold text-ink">Merge (Recommended)</div>
                  <div className="text-[10px] text-slate mt-1">
                    Combines imported pages & sessions with existing data.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    importMode === 'replace'
                      ? 'bg-red-50 border-red-500 text-ink font-semibold ring-1 ring-red-500'
                      : 'bg-surface/40 border-surface-border text-slate hover:bg-surface'
                  }`}
                >
                  <div className="text-xs font-bold text-red-700">Replace (Overwrite)</div>
                  <div className="text-[10px] text-slate mt-1">
                    Erases current state and replaces with imported file.
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-slate hover:text-ink text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-teal-deep hover:bg-teal-forest text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isImporting ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Import ({importMode === 'merge' ? 'Merge' : 'Replace'})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
