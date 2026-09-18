import {
  PageRetentionState,
  MasteryLevel,
  DecayLevel,
  ContiguousCluster,
  ActivityStreak,
  SessionType,
  StudySession,
  SessionPage,
  MemorizedPage,
  JuzMeta,
  Profile,
  DailyQueueRecommendation
} from './types';
import {
  getTotalPages,
  getJuzBounds,
  getSurahForPage,
  getJuzForPage,
  getRubForPage,
  getNaturalQuranChunks
} from './quran-meta';

/**
 * Normalizes a date given a user's day_cutoff_hour (e.g. 3 AM).
 * If the time is before day_cutoff_hour (e.g., 1:30 AM), it belongs to the PREVIOUS day.
 */
export function getAdjustedSessionDate(
  dateInput: Date | string,
  cutoffHour: number = 3
): Date {
  const d = new Date(dateInput);
  if (d.getHours() < cutoffHour) {
    const adjusted = new Date(d);
    adjusted.setDate(adjusted.getDate() - 1);
    return adjusted;
  }
  return d;
}

/**
 * Calculates 2D Wear & Decay Heatmap state for pages dynamically.
 */
export function calculateRetentionStates(
  memorizedPages: MemorizedPage[],
  sessions: StudySession[],
  sessionPages: SessionPage[],
  profile: Profile,
  referenceDate: Date = new Date()
): Map<number, PageRetentionState> {
  const retentionMap = new Map<number, PageRetentionState>();
  const totalPages = getTotalPages(profile.mushaf_layout);
  const cutoffHour = profile.day_cutoff_hour ?? 3;

  // Map memorized pages
  const memorizedSet = new Map<number, string>();
  memorizedPages.forEach(m => {
    memorizedSet.set(m.page_number, m.memorized_at);
  });

  // Collect touch timestamps and stumble states per page
  const pageTouchesMap = new Map<number, Date[]>();
  const pageStumbledMap = new Map<number, boolean>();

  // Sort sessions chronologically
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const sessionById = new Map<string, StudySession>();
  sortedSessions.forEach(s => sessionById.set(s.id, s));

  sessionPages.forEach(sp => {
    const session = sessionById.get(sp.session_id);
    if (session) {
      const adjustedDate = getAdjustedSessionDate(session.logged_at, cutoffHour);
      const existing = pageTouchesMap.get(sp.page_number) || [];
      existing.push(adjustedDate);
      pageTouchesMap.set(sp.page_number, existing);

      if (sp.stumbled) {
        pageStumbledMap.set(sp.page_number, true);
      }
    }
  });

  const refAdjusted = getAdjustedSessionDate(referenceDate, cutoffHour);
  const refTime = refAdjusted.getTime();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const isMemorized = memorizedSet.has(pageNum);
    const memorizedAt = memorizedSet.get(pageNum) || null;
    const touches = pageTouchesMap.get(pageNum) || [];
    const totalTouches = touches.length;

    let lastTouchedAt: string | null = null;
    let daysSinceTouch: number | null = null;

    if (touches.length > 0) {
      const latestTouch = touches[touches.length - 1];
      lastTouchedAt = latestTouch.toISOString();
      const diffMs = refTime - latestTouch.getTime();
      daysSinceTouch = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    } else if (isMemorized && memorizedAt) {
      const memDate = getAdjustedSessionDate(memorizedAt, cutoffHour);
      lastTouchedAt = memDate.toISOString();
      const diffMs = refTime - memDate.getTime();
      daysSinceTouch = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // 1st Dimension: Lifetime Mastery (Hue / Depth)
    let masteryLevel: MasteryLevel = 'unmemorized';
    if (isMemorized) {
      if (totalTouches === 0 || totalTouches <= 10) {
        masteryLevel = 'sand';
      } else if (totalTouches <= 25) {
        masteryLevel = 'amber';
      } else {
        masteryLevel = 'sage';
      }
    }

    // 2nd Dimension: Current Decay (Opacity / Desaturation)
    let decayLevel: DecayLevel | null = null;
    if (isMemorized && daysSinceTouch !== null) {
      const warnDays = profile.stale_warning_days ?? 14;
      if (daysSinceTouch <= Math.floor(warnDays / 2)) {
        decayLevel = 'fresh';
      } else if (daysSinceTouch <= warnDays) {
        decayLevel = 'cooling';
      } else {
        decayLevel = 'decaying';
      }
    }

    const surah = getSurahForPage(pageNum, profile.mushaf_layout);
    const juzNumber = getJuzForPage(pageNum, profile.mushaf_layout);
    const rubNumber = getRubForPage(pageNum, profile.mushaf_layout);
    const stumbled = pageStumbledMap.get(pageNum) || false;

    retentionMap.set(pageNum, {
      pageNumber: pageNum,
      isMemorized,
      memorizedAt,
      totalTouches,
      lastTouchedAt,
      daysSinceTouch,
      stumbled,
      masteryLevel,
      decayLevel,
      surahName: surah.nameEnglish,
      juzNumber,
      rubNumber
    });
  }

  return retentionMap;
}

/**
 * Natural Contiguity Suggestion Engine.
 */
export function getTopStaleContiguousClusters(
  retentionMap: Map<number, PageRetentionState>,
  profile: Profile
): ContiguousCluster[] {
  const chunks = getNaturalQuranChunks(profile.mushaf_layout);
  const clusters: ContiguousCluster[] = [];

  chunks.forEach(chunk => {
    const memorizedInChunk = chunk.pages.filter(p => retentionMap.get(p)?.isMemorized);

    if (memorizedInChunk.length === 0) return;

    let totalStalenessDays = 0;
    let stumbledCount = 0;

    memorizedInChunk.forEach(p => {
      const state = retentionMap.get(p);
      const days = state?.daysSinceTouch ?? profile.stale_critical_days ?? 28;
      totalStalenessDays += days;
      if (state?.stumbled) {
        stumbledCount++;
      }
    });

    const averageDaysStale = Math.round(totalStalenessDays / memorizedInChunk.length);

    clusters.push({
      id: chunk.id,
      type: chunk.type,
      title: chunk.title,
      subtitle: chunk.subtitle,
      startPage: chunk.startPage,
      endPage: chunk.endPage,
      averageDaysStale,
      pages: chunk.pages,
      stumbledPagesCount: stumbledCount
    });
  });

  clusters.sort((a, b) => {
    if (b.stumbledPagesCount !== a.stumbledPagesCount) {
      return b.stumbledPagesCount - a.stumbledPagesCount;
    }
    return b.averageDaysStale - a.averageDaysStale;
  });

  return clusters.slice(0, 3);
}

/**
 * Calculates 3 Independent Activity Streaks with day_cutoff_hour forgiveness.
 */
export function calculateIndependentStreaks(
  sessions: StudySession[],
  profile: Profile,
  referenceDate: Date = new Date()
): Record<SessionType, ActivityStreak> {
  const types: SessionType[] = ['memorize', 'revise', 'recite'];
  const result: Partial<Record<SessionType, ActivityStreak>> = {};

  const cutoffHour = profile.day_cutoff_hour ?? 3;

  const getDayString = (d: Date) => {
    const adjusted = getAdjustedSessionDate(d, cutoffHour);
    const year = adjusted.getFullYear();
    const month = String(adjusted.getMonth() + 1).padStart(2, '0');
    const day = String(adjusted.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getDayString(referenceDate);

  const yesterdayDate = new Date(referenceDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getDayString(yesterdayDate);

  types.forEach(t => {
    const typeSessions = sessions.filter(s => s.type === t);
    const loggedDatesSet = new Set<string>();

    typeSessions.forEach(s => {
      loggedDatesSet.add(getDayString(new Date(s.logged_at)));
    });

    const loggedToday = loggedDatesSet.has(todayStr);
    const loggedYesterday = loggedDatesSet.has(yesterdayStr);

    const isAlive = loggedToday || loggedYesterday;

    let currentStreak = 0;

    if (isAlive) {
      let checkDate = loggedToday ? new Date(referenceDate) : yesterdayDate;
      while (loggedDatesSet.has(getDayString(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    const sorted = [...typeSessions].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );

    const labelMap: Record<SessionType, string> = {
      memorize: 'Memorization',
      revise: 'Revision',
      recite: 'Recitation'
    };

    result[t] = {
      type: t,
      label: labelMap[t],
      currentStreak,
      lastLoggedAt: sorted[0]?.logged_at || null,
      isAlive,
      loggedToday,
      loggedYesterday
    };
  });

  return result as Record<SessionType, ActivityStreak>;
}

/**
 * Computes Juz macro metadata for 30 Juz strip dynamically.
 */
export function getJuzMacroMetadata(
  retentionMap: Map<number, PageRetentionState>,
  profile: Profile
): JuzMeta[] {
  const bounds = getJuzBounds(profile.mushaf_layout);
  const warningDays = profile.stale_warning_days ?? 14;
  const criticalDays = profile.stale_critical_days ?? 28;

  return bounds.map(j => {
    let totalMemorized = 0;
    let maxStalenessDays = 0;
    let hasWarningStaleness = false;
    let hasCriticalStaleness = false;
    const surahNamesSet = new Set<string>();

    for (let p = j.startPage; p <= j.endPage; p++) {
      const state = retentionMap.get(p);
      if (state) {
        surahNamesSet.add(state.surahName);
        if (state.isMemorized) {
          totalMemorized++;
          const days = state.daysSinceTouch ?? 0;
          if (days > maxStalenessDays) {
            maxStalenessDays = days;
          }
          if (days >= criticalDays) {
            hasCriticalStaleness = true;
          } else if (days >= warningDays) {
            hasWarningStaleness = true;
          }
        }
      }
    }

    return {
      juzNumber: j.juzNumber,
      startPage: j.startPage,
      endPage: j.endPage,
      surahNames: Array.from(surahNamesSet),
      totalMemorized,
      maxStalenessDays,
      hasWarningStaleness,
      hasCriticalStaleness
    };
  });
}

/**
 * Calculates automated daily revision queue based on decay, stumbled pages, and target daily revision page count.
 */
export function generateDailyRevisionQueue(
  retentionMap: Map<number, PageRetentionState>,
  profile: Profile
): DailyQueueRecommendation | null {
  const memorizedList: PageRetentionState[] = [];
  retentionMap.forEach(state => {
    if (state.isMemorized) memorizedList.push(state);
  });

  if (memorizedList.length === 0) return null;

  const targetCount = profile.default_daily_revision_pages ?? 5;

  // Collect candidate pages prioritizing:
  // 1. Stumbled pages
  // 2. High decay / unrevised days (descending)
  const stumbledPages = memorizedList.filter(p => p.stumbled);
  const unrevisedPages = [...memorizedList].sort(
    (a, b) => (b.daysSinceTouch ?? 0) - (a.daysSinceTouch ?? 0)
  );

  const selectedSet = new Set<number>();

  // Add stumbled pages first
  stumbledPages.forEach(p => {
    if (selectedSet.size < targetCount) {
      selectedSet.add(p.pageNumber);
    }
  });

  // Top unrevised pages
  for (const p of unrevisedPages) {
    if (selectedSet.size >= targetCount) break;
    selectedSet.add(p.pageNumber);
  }

  const selectedPages = Array.from(selectedSet).sort((a, b) => a - b);
  if (selectedPages.length === 0) return null;

  const stumbledInQueue = selectedPages.filter(p => retentionMap.get(p)?.stumbled).length;
  const unrevisedInQueue = selectedPages.filter(p => (retentionMap.get(p)?.daysSinceTouch ?? 0) >= (profile.stale_warning_days ?? 14)).length;

  const firstPage = selectedPages[0];
  const lastPage = selectedPages[selectedPages.length - 1];
  const surahName = retentionMap.get(firstPage)?.surahName || '';

  let title = `pp. ${firstPage}–${lastPage} (${selectedPages.length} pp.)`;
  if (selectedPages.length === 1) {
    title = `Page ${firstPage} (${surahName})`;
  } else if (surahName) {
    title = `${surahName} (pp. ${firstPage}–${lastPage})`;
  }

  const reasons: string[] = [];
  if (stumbledInQueue > 0) reasons.push(`${stumbledInQueue} stumbled page(s)`);
  if (unrevisedInQueue > 0) reasons.push(`${unrevisedInQueue} unrevised target(s)`);
  if (reasons.length === 0) reasons.push(`Regular daily maintenance touch`);

  const reasonSummary = reasons.join(' • ');
  const estimatedMinutes = Math.max(5, selectedPages.length * 3);

  return {
    pages: selectedPages,
    title,
    reasonSummary,
    estimatedMinutes,
    stumbledCount: stumbledInQueue,
    unrevisedCount: unrevisedInQueue
  };
}

