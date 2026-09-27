'use client';

import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    if (typeof window !== 'undefined') {
      const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneApp);

      // Online / Offline status
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Listen for browser PWA install event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 5000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the RABT PWA install prompt');
      } else {
        console.log('User dismissed the RABT PWA install prompt');
      }
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Render Offline Banner if user goes offline
  if (isOffline) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 bg-amber-warm text-white rounded-xl shadow-card flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-white shrink-0" />
          <span>Offline Mode — All log entries will sync when reconnected.</span>
        </div>
      </div>
    );
  }

  // Render Installed Success Toast
  if (installedSuccess) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[90%] bg-teal-forest text-white p-4 rounded-2xl shadow-modal flex items-center gap-3 text-xs font-medium border border-teal-deep">
        <CheckCircle2 className="w-5 h-5 text-teal-light shrink-0" />
        <div>
          <p className="font-bold">RABT App Installed!</p>
          <p className="text-teal-light/80 text-[11px]">You can now launch RABT directly from your home screen.</p>
        </div>
      </div>
    );
  }

  // Do not show prompt if already installed, dismissed, or prompt not available
  if (isStandalone || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-white border border-surface-border p-3.5 sm:p-4 rounded-2xl shadow-modal flex items-center justify-between gap-4 animate-slideUp">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center font-arabic text-xl font-bold shrink-0 shadow-subtle">
          ر
        </div>
        <div>
          <p className="text-xs font-bold text-ink">Install RABT App</p>
          <p className="text-[11px] text-slate font-medium">Add to Home Screen for fast offline access</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-teal-deep hover:bg-teal-forest text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-slate hover:text-ink rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
