'use client';

import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X, CheckCircle2, Share, PlusSquare, Smartphone, Laptop } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Detect Standalone mode (Installed PWA)
      const isStandaloneApp =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneApp);

      // 2. Detect iOS / iPadOS Safari
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
      setIsIOS(isIOSDevice);

      // 3. Track Network Connectivity
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 4. Listen for Chrome/Android/Edge beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setShowIOSModal(false);
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
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the RABT PWA installation');
      }
    } catch (err) {
      console.error('Error launching install prompt:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* 1. Offline Banner Toast */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 bg-amber-warm text-white rounded-xl shadow-modal flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-white shrink-0" />
            <span>Offline Mode Active — Hifz logs are saved locally and will sync when online.</span>
          </div>
        </div>
      )}

      {/* 2. Installation Success Notification */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[90%] bg-teal-forest text-white p-4 rounded-2xl shadow-modal flex items-center gap-3 text-xs font-medium border border-teal-deep">
          <CheckCircle2 className="w-5 h-5 text-teal-light shrink-0" />
          <div>
            <p className="font-bold">RABT App Installed Successfully!</p>
            <p className="text-teal-light/80 text-[11px]">You can now launch RABT directly from your Home Screen anytime.</p>
          </div>
        </div>
      )}

      {/* 3. iOS Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-modal border border-surface-border text-ink space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-deep text-white flex items-center justify-center font-arabic text-lg font-bold">
                  ر
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Install RABT on iOS / Safari</h3>
                  <p className="text-[11px] text-slate font-medium">Add to your iPhone or iPad Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                <div className="p-2 bg-teal-light text-teal-forest rounded-lg font-bold shrink-0">1</div>
                <div>
                  <p className="font-semibold text-ink flex items-center gap-1.5">
                    Tap the Share Button <Share className="w-3.5 h-3.5 text-teal-deep inline" />
                  </p>
                  <p className="text-slate text-[11px]">Look for the Share icon at the bottom or top of your Safari browser bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                <div className="p-2 bg-teal-light text-teal-forest rounded-lg font-bold shrink-0">2</div>
                <div>
                  <p className="font-semibold text-ink flex items-center gap-1.5">
                    Select &quot;Add to Home Screen&quot; <PlusSquare className="w-3.5 h-3.5 text-teal-deep inline" />
                  </p>
                  <p className="text-slate text-[11px]">Scroll down the share menu list and tap &quot;Add to Home Screen&quot;.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                <div className="p-2 bg-teal-light text-teal-forest rounded-lg font-bold shrink-0">3</div>
                <div>
                  <p className="font-semibold text-ink">Launch RABT App</p>
                  <p className="text-slate text-[11px]">Tap &quot;Add&quot; at the top right. RABT is now installed as a full standalone app!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-teal-deep hover:bg-teal-forest text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* 4. Bottom Installation Toast (Android, iOS, or Desktop) */}
      {!isStandalone && !isDismissed && (deferredPrompt || isIOS) && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-white border border-surface-border p-3.5 sm:p-4 rounded-2xl shadow-modal flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center font-arabic text-xl font-bold shrink-0 shadow-subtle">
              ر
            </div>
            <div>
              <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span>Install RABT App</span>
                {isIOS ? <Smartphone className="w-3.5 h-3.5 text-teal-deep" /> : <Laptop className="w-3.5 h-3.5 text-teal-deep" />}
              </p>
              <p className="text-[11px] text-slate font-medium">Install for fast offline access on your device</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-teal-deep hover:bg-teal-forest text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle active:scale-95"
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
      )}
    </>
  );
}
