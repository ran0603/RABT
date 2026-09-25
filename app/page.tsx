'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { globalStore } from '../lib/store';
import {
  calculateRetentionStates,
  getTopStaleContiguousClusters,
  calculateIndependentStreaks,
  getJuzMacroMetadata,
  generateDailyRevisionQueue
} from '../lib/retention-engine';
import { PageRetentionState, SessionType, Profile, MushafLayout } from '../lib/types';
import { getJuzBounds, getTotalPages } from '../lib/quran-meta';
import { getLocalUser, setLocalUser } from '../lib/supabase-client';
import { Header } from '../components/Header';
import { ActivityStreaks } from '../components/ActivityStreaks';
import { ContiguityChips } from '../components/ContiguityChips';
import { JuzMacroStrip } from '../components/JuzMacroStrip';
import { PageCanvasGrid } from '../components/PageCanvasGrid';
import { StagingTray } from '../components/StagingTray';
import { PageInspectorModal } from '../components/PageInspectorModal';
import { LogSessionDrawer } from '../components/LogSessionDrawer';
import { LegendDrawer } from '../components/LegendDrawer';
import { OnboardingModal } from '../components/OnboardingModal';
import { WelcomeAuthScreen } from '../components/WelcomeAuthScreen';
import { EmailVerificationAlert } from '../components/EmailVerificationAlert';
import { TeacherShareModal } from '../components/TeacherShareModal';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [storeState, setStoreState] = useState({
    memorized: globalStore.getMemorizedPages(),
    sessions: globalStore.getSessions(),
    sessionPages: globalStore.getSessionPages(),
    profile: globalStore.getProfile()
  });

  // UI state
  const [selectedJuz, setSelectedJuz] = useState<number | null>(1);
  const [selectedPageNumbers, setSelectedPageNumbers] = useState<Set<number>>(new Set());
  const [stumbledStagingPages, setStumbledStagingPages] = useState<Set<number>>(new Set());
  const [inspectedPage, setInspectedPage] = useState<PageRetentionState | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [logInitialType, setLogInitialType] = useState<SessionType>('revise');

  // Check auth state on mount and trigger remote sync across devices
  useEffect(() => {
    const user = getLocalUser();
    const isAuth = Boolean(user);
    setIsAuthenticated(isAuth);

    if (isAuth && user && user.id) {
      globalStore.syncWithRemoteUser(user.id).then(() => {
        setStoreState({
          memorized: globalStore.getMemorizedPages(),
          sessions: globalStore.getSessions(),
          sessionPages: globalStore.getSessionPages(),
          profile: globalStore.getProfile()
        });
      });
    }
  }, []);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = globalStore.subscribe(() => {
      setStoreState({
        memorized: globalStore.getMemorizedPages(),
        sessions: globalStore.getSessions(),
        sessionPages: globalStore.getSessionPages(),
        profile: globalStore.getProfile()
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const activeProfile = storeState.profile;
  const totalPages = getTotalPages(activeProfile.mushaf_layout);
  const juzBounds = getJuzBounds(activeProfile.mushaf_layout);

  // Compute 2D Wear & Decay Retention Heatmap dynamically
  const retentionMap = useMemo(() => {
    return calculateRetentionStates(
      storeState.memorized,
      storeState.sessions,
      storeState.sessionPages,
      activeProfile
    );
  }, [storeState, activeProfile]);

  // Compute 3 Independent Activity Streaks
  const streaks = useMemo(() => {
    return calculateIndependentStreaks(storeState.sessions, activeProfile);
  }, [storeState.sessions, activeProfile]);

  // Compute 30 Juz Macro Strip Metadata
  const juzMacroList = useMemo(() => {
    return getJuzMacroMetadata(retentionMap, activeProfile);
  }, [retentionMap, activeProfile]);

  // Compute Top 3 Stalest Contiguous Clusters
  const topStaleClusters = useMemo(() => {
    return getTopStaleContiguousClusters(retentionMap, activeProfile);
  }, [retentionMap, activeProfile]);

  // Compute Automated Daily Revision Queue Target
  const dailyQueue = useMemo(() => {
    return generateDailyRevisionQueue(retentionMap, activeProfile);
  }, [retentionMap, activeProfile]);

  // Total memorized count
  const totalMemorizedCount = useMemo(() => {
    let count = 0;
    retentionMap.forEach(p => {
      if (p.isMemorized) count++;
    });
    return count;
  }, [retentionMap]);

  // Filter pages for current canvas view
  const displayedPages = useMemo(() => {
    const pageList: PageRetentionState[] = [];
    if (selectedJuz === null) {
      for (let p = 1; p <= totalPages; p++) {
        const state = retentionMap.get(p);
        if (state) pageList.push(state);
      }
    } else {
      const bound = juzBounds.find(j => j.juzNumber === selectedJuz);
      if (bound) {
        for (let p = bound.startPage; p <= bound.endPage; p++) {
          const state = retentionMap.get(p);
          if (state) pageList.push(state);
        }
      }
    }
    return pageList;
  }, [selectedJuz, retentionMap, totalPages, juzBounds]);

  // Handlers
  const handleSelectPages = (pages: number[]) => {
    setSelectedPageNumbers(new Set(pages));
  };

  const handleClearSelection = () => {
    setSelectedPageNumbers(new Set());
    setStumbledStagingPages(new Set());
  };

  const handleToggleStumbleStaging = (pageNum: number) => {
    const nextStumbled = new Set(stumbledStagingPages);
    if (nextStumbled.has(pageNum)) {
      nextStumbled.delete(pageNum);
    } else {
      nextStumbled.add(pageNum);
    }
    setStumbledStagingPages(nextStumbled);

    if (!selectedPageNumbers.has(pageNum)) {
      const nextSet = new Set(selectedPageNumbers);
      nextSet.add(pageNum);
      setSelectedPageNumbers(nextSet);
    }
  };

  const handleToggleStumbleForSelected = () => {
    const anyStumbled = Array.from(selectedPageNumbers).some(p => stumbledStagingPages.has(p));
    const nextStumbled = new Set(stumbledStagingPages);

    if (anyStumbled) {
      selectedPageNumbers.forEach(p => nextStumbled.delete(p));
    } else {
      selectedPageNumbers.forEach(p => nextStumbled.add(p));
    }
    setStumbledStagingPages(nextStumbled);
  };

  const handleSelectCluster = (clusterPages: number[]) => {
    if (clusterPages.length > 0) {
      const firstPage = clusterPages[0];
      const juzNum = juzBounds.find(j => firstPage >= j.startPage && firstPage <= j.endPage)?.juzNumber;
      if (juzNum) {
        setSelectedJuz(juzNum);
      }
    }
    setSelectedPageNumbers(new Set(clusterPages));
  };

  const handleOpenLogModal = (type: SessionType = 'revise') => {
    setLogInitialType(type);
    setIsLogDrawerOpen(true);
  };

  const handleSubmitSession = async (
    type: SessionType,
    pageNumbers: number[],
    stumbledPagesList: number[],
    notes: string
  ) => {
    await globalStore.logSession(type, pageNumbers, stumbledPagesList, notes);
    setSelectedPageNumbers(new Set());
    setStumbledStagingPages(new Set());
  };

  const handleToggleMemorizedPage = (pageNum: number, currentMem: boolean) => {
    globalStore.toggleMemorizedPages([pageNum], !currentMem);
    if (inspectedPage && inspectedPage.pageNumber === pageNum) {
      const updated = retentionMap.get(pageNum);
      if (updated) setInspectedPage(updated);
    }
  };

  const handleCompleteOnboarding = (onboardingData: {
    mushaf_layout: MushafLayout;
    default_daily_revision_pages: number;
    stale_warning_days: number;
  }) => {
    globalStore.updateProfile({
      ...onboardingData,
      has_confirmed_onboarding: true
    });
  };

  const handleSignOut = () => {
    setLocalUser(null);
    setIsAuthenticated(false);
  };

  // If loading auth state, show minimal loader
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-teal-deep flex items-center justify-center text-white animate-pulse">
          <span className="font-arabic text-lg font-bold">ر</span>
        </div>
      </div>
    );
  }

  // Guest User Auth Wall — If unauthenticated, present Welcome & Sign In / Sign Up Screen
  if (!isAuthenticated) {
    return <WelcomeAuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header (Clean, authenticated dashboard view) */}
      <Header
        onOpenLegend={() => setIsLegendOpen(true)}
        onOpenLogDrawer={() => handleOpenLogModal('revise')}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        totalMemorized={totalMemorizedCount}
      />

      {/* Unverified Email Cross-Device Sync Warning Banner */}
      <EmailVerificationAlert />

      {/* 3 Independent Streaks Strip (Sunday start, Today/Yesterday forgiveness with day cutoff hour) */}
      <ActivityStreaks streaks={streaks} />

      {/* Natural Contiguity Engine Quick-Fill Chips */}
      <ContiguityChips
        clusters={topStaleClusters}
        onSelectCluster={handleSelectCluster}
      />

      {/* 30 Juz Macro Strip */}
      <JuzMacroStrip
        juzList={juzMacroList}
        selectedJuz={selectedJuz}
        onSelectJuz={setSelectedJuz}
      />

      {/* Active Canvas Micro View */}
      <section className="max-w-4xl lg:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4">
        {/* Canvas Header Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-deep" />
            <h2 className="text-sm font-bold text-ink">
              {selectedJuz === null
                ? `Active Canvas — All ${totalPages} Pages (${activeProfile.mushaf_layout === 'indopak_848' ? 'Indo-Pak 848' : 'Madinah 604'})`
                : `Juz ${selectedJuz} Micro Canvas (pp. ${
                    juzBounds.find(j => j.juzNumber === selectedJuz)?.startPage
                  }–${juzBounds.find(j => j.juzNumber === selectedJuz)?.endPage})`}
            </h2>
          </div>

          <span className="text-xs text-slate font-medium hidden sm:inline">
            Scrub drag to select range • Double-tap to flag stumble
          </span>
        </div>

        {/* 5-Column Grid Page Canvas */}
        <PageCanvasGrid
          pages={displayedPages}
          selectedPageNumbers={selectedPageNumbers}
          stumbledStagingPages={stumbledStagingPages}
          onSelectPages={handleSelectPages}
          onInspectPage={setInspectedPage}
          onToggleStumbleStaging={handleToggleStumbleStaging}
        />
      </section>

      {/* Staging Tray & Fast Action Bar */}
      <StagingTray
        selectedPages={Array.from(selectedPageNumbers)}
        stumbledStagingPages={stumbledStagingPages}
        totalPages={totalPages}
        onSelectPages={handleSelectPages}
        onClearSelection={handleClearSelection}
        onToggleStumbleForSelected={handleToggleStumbleForSelected}
        onSubmitSession={handleSubmitSession}
      />

      {/* Page Heuristic Inspector Modal */}
      <PageInspectorModal
        page={inspectedPage}
        onClose={() => setInspectedPage(null)}
        onToggleMemorized={handleToggleMemorizedPage}
        onToggleStumble={(pageNum) => {
          handleToggleStumbleStaging(pageNum);
          if (inspectedPage) {
            setInspectedPage({
              ...inspectedPage,
              stumbled: !inspectedPage.stumbled
            });
          }
        }}
      />

      {/* Session Logger Drawer */}
      <LogSessionDrawer
        isOpen={isLogDrawerOpen}
        initialType={logInitialType}
        selectedPages={Array.from(selectedPageNumbers)}
        stumbledPages={stumbledStagingPages}
        totalPages={totalPages}
        onClose={() => setIsLogDrawerOpen(false)}
        onSubmitSession={handleSubmitSession}
      />

      {/* Teacher / Circle Share Modal */}
      <TeacherShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={activeProfile}
        totalMemorized={totalMemorizedCount}
        streaks={streaks}
      />

      {/* Heuristics & Legend Drawer */}
      <LegendDrawer
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* First-Time Profile Onboarding Setup Modal */}
      <OnboardingModal
        isOpen={activeProfile.has_confirmed_onboarding !== true}
        onComplete={handleCompleteOnboarding}
      />
    </main>
  );
}
