export type SessionType = 'memorize' | 'revise' | 'recite';
export type MushafLayout = 'madinah_604' | 'indopak_848';

export interface Profile {
  id: string;
  full_name: string | null;
  week_start_day: number; // 0 = Sunday
  mushaf_layout: MushafLayout;
  timezone: string;
  day_cutoff_hour: number; // 0 to 12 (default: 3 AM)
  stale_warning_days: number; // default: 14
  stale_critical_days: number; // default: 28
  default_daily_revision_pages: number; // default: 5
  has_confirmed_onboarding?: boolean;
}

export interface MemorizedPage {
  user_id: string;
  page_number: number; // 1 - 604 or 1 - 848 depending on layout
  memorized_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  type: SessionType;
  logged_at: string;
  notes?: string | null;
}

export interface SessionPage {
  session_id: string;
  page_number: number;
  stumbled: boolean;
}

// 2D Wear & Decay Heatmap & Retention Heuristic Types
export type MasteryLevel = 'unmemorized' | 'sand' | 'amber' | 'sage'; // 0, 1-10, 11-25, 26+
export type DecayLevel = 'fresh' | 'cooling' | 'decaying'; // 0-7d, 8-21d, 22+d

export interface PageRetentionState {
  pageNumber: number;
  isMemorized: boolean;
  memorizedAt: string | null;
  totalTouches: number; // Revision touches count
  lastTouchedAt: string | null;
  daysSinceTouch: number | null; // null if unmemorized
  stumbled: boolean;
  masteryLevel: MasteryLevel;
  decayLevel: DecayLevel | null;
  surahName: string;
  juzNumber: number;
  rubNumber: number;
}

export interface ContiguousCluster {
  id: string;
  type: 'surah' | 'rub' | 'juz';
  title: string;
  subtitle: string;
  startPage: number;
  endPage: number;
  averageDaysStale: number;
  pages: number[];
  stumbledPagesCount: number;
}

export interface ActivityStreak {
  type: SessionType;
  label: string;
  currentStreak: number;
  lastLoggedAt: string | null;
  isAlive: boolean; // Today or yesterday forgiveness with day cutoff hour
  loggedToday: boolean;
  loggedYesterday: boolean;
}

export interface JuzMeta {
  juzNumber: number;
  startPage: number;
  endPage: number;
  surahNames: string[];
  totalMemorized: number;
  maxStalenessDays: number;
  hasWarningStaleness: boolean; // >stale_warning_days
  hasCriticalStaleness: boolean; // >stale_critical_days
}

export interface RABTExportData {
  version: string;
  appName: string;
  exportedAt: string;
  profile?: Partial<Profile>;
  memorizedPages: MemorizedPage[];
  sessions: StudySession[];
  sessionPages: SessionPage[];
}

