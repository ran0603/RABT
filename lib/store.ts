import { MemorizedPage, StudySession, SessionPage, SessionType, Profile, MushafLayout, RABTExportData } from './types';
import {
  supabase,
  isSupabaseConfigured,
  fetchRemoteUserData,
  getLocalUser,
  isValidUUID,
  DEFAULT_USER_UUID,
  generateValidUUID
} from './supabase-client';

const LOCAL_STORAGE_KEY_MEMORIZED = 'rabt_memorized_pages';
const LOCAL_STORAGE_KEY_SESSIONS = 'rabt_study_sessions';
const LOCAL_STORAGE_KEY_SESSION_PAGES = 'rabt_session_pages';
const LOCAL_STORAGE_KEY_PROFILE = 'rabt_user_profile';

export const DEFAULT_PROFILE: Profile = {
  id: DEFAULT_USER_UUID,
  full_name: 'Hifz Learner',
  week_start_day: 0, // Sunday
  mushaf_layout: 'madinah_604',
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
  day_cutoff_hour: 3, // 3 AM cutoff
  stale_warning_days: 14,
  stale_critical_days: 28,
  default_daily_revision_pages: 5,
  has_confirmed_onboarding: false
};

function getEmptyInitialData() {
  return {
    memorizedPages: [] as MemorizedPage[],
    sessions: [] as StudySession[],
    sessionPages: [] as SessionPage[]
  };
}

export function getSampleSeedData() {
  const memorizedPages: MemorizedPage[] = [];
  const sessions: StudySession[] = [];
  const sessionPages: SessionPage[] = [];

  const now = new Date();
  const getDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const pageRanges = [
    { start: 1, end: 61, baseTouches: 28, ageDays: 1 },
    { start: 262, end: 281, baseTouches: 8, ageDays: 34 },
    { start: 282, end: 301, baseTouches: 14, ageDays: 12 },
    { start: 562, end: 581, baseTouches: 22, ageDays: 4 },
    { start: 582, end: 604, baseTouches: 32, ageDays: 0 }
  ];

  let sessionIdCounter = 1;

  pageRanges.forEach(range => {
    for (let p = range.start; p <= range.end; p++) {
      memorizedPages.push({
        user_id: DEFAULT_USER_UUID,
        page_number: p,
        memorized_at: getDaysAgo(120)
      });
    }

    for (let i = 0; i < range.baseTouches; i++) {
      const daysAgo = Math.max(range.ageDays, Math.floor(i * (100 / range.baseTouches)));
      const sessId = `session-${sessionIdCounter++}`;
      const sessType: SessionType = i % 4 === 0 ? 'memorize' : i % 3 === 0 ? 'recite' : 'revise';

      sessions.push({
        id: sessId,
        user_id: DEFAULT_USER_UUID,
        type: sessType,
        logged_at: getDaysAgo(daysAgo),
        notes: i === 0 ? `Initial Murājaʿah touch for range ${range.start}-${range.end}` : null
      });

      for (let p = range.start; p <= range.end; p++) {
        const isStumbled = (p === 272 || p === 274) && i === range.baseTouches - 1;

        sessionPages.push({
          session_id: sessId,
          page_number: p,
          stumbled: isStumbled
        });
      }
    }
  });

  return { memorizedPages, sessions, sessionPages };
}

export class RABTStore {
  private memorizedPages: MemorizedPage[] = [];
  private sessions: StudySession[] = [];
  private sessionPages: SessionPage[] = [];
  private profile: Profile = { ...DEFAULT_PROFILE };
  private listeners: Set<() => void> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    this.loadState();
    this.initRemoteSync();
  }

  private loadState() {
    if (typeof window === 'undefined') {
      const empty = getEmptyInitialData();
      this.memorizedPages = empty.memorizedPages;
      this.sessions = empty.sessions;
      this.sessionPages = empty.sessionPages;
      return;
    }

    const localMem = localStorage.getItem(LOCAL_STORAGE_KEY_MEMORIZED);
    const localSess = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
    const localSessPages = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION_PAGES);
    const localProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

    if (localProfile) {
      try {
        this.profile = { ...DEFAULT_PROFILE, ...JSON.parse(localProfile) };
      } catch (e) {
        this.profile = { ...DEFAULT_PROFILE };
      }
    }

    if (localMem && localSess && localSessPages) {
      try {
        this.memorizedPages = JSON.parse(localMem);
        this.sessions = JSON.parse(localSess);
        this.sessionPages = JSON.parse(localSessPages);
      } catch (e) {
        console.error('Failed to parse local RABT state, clearing to empty:', e);
        this.clearToEmptyData();
      }
    } else {
      this.clearToEmptyData();
    }
  }

  public async initRemoteSync() {
    if (typeof window === 'undefined' || !isSupabaseConfigured || !supabase) return;

    try {
      const activeUserId = await this.getActiveUserId();
      if (isValidUUID(activeUserId)) {
        await this.syncWithRemoteUser(activeUserId);
      }
    } catch (err) {
      console.warn('Initial remote sync warning:', err);
    }
  }

  /**
   * Bi-directional synchronization across all devices for the signed-in user
   */
  public async syncWithRemoteUser(userId: string) {
    if (!isSupabaseConfigured || !supabase || this.isSyncing) return;
    if (!isValidUUID(userId)) return;

    this.isSyncing = true;

    try {
      const remote = await fetchRemoteUserData(userId);

      if (remote) {
        if (remote.profile) {
          this.profile = {
            ...this.profile,
            ...remote.profile,
            id: userId,
            has_confirmed_onboarding: true
          };
        }

        if (remote.sessions.length > 0 || remote.memorizedPages.length > 0) {
          this.memorizedPages = remote.memorizedPages;
          this.sessions = remote.sessions;
          this.sessionPages = remote.sessionPages;
        } else if (this.memorizedPages.length > 0 || this.sessions.length > 0) {
          await this.uploadLocalDataToRemote(userId);
        }

        this.saveState();
      }
    } catch (err) {
      console.warn('Cross-device remote sync warning:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async getActiveUserId(): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id && isValidUUID(user.id)) {
          return user.id;
        }
      } catch (e) {
        // fallback
      }
    }

    const localUser = getLocalUser();
    if (localUser && localUser.id && isValidUUID(localUser.id)) {
      return localUser.id;
    }

    return DEFAULT_USER_UUID;
  }

  private async uploadLocalDataToRemote(userId: string) {
    if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return;

    try {
      const sb = supabase;

      // Upsert profile
      await sb.from('profiles').upsert({
        id: userId,
        full_name: this.profile.full_name || 'Hifz Learner',
        week_start_day: this.profile.week_start_day,
        mushaf_layout: this.profile.mushaf_layout,
        timezone: this.profile.timezone,
        day_cutoff_hour: this.profile.day_cutoff_hour,
        stale_warning_days: this.profile.stale_warning_days,
        stale_critical_days: this.profile.stale_critical_days,
        default_daily_revision_pages: this.profile.default_daily_revision_pages
      });

      // Upsert memorized pages
      if (this.memorizedPages.length > 0) {
        const memRecords = this.memorizedPages.map(m => ({
          user_id: userId,
          page_number: m.page_number,
          memorized_at: m.memorized_at
        }));
        await sb.from('memorized_pages').upsert(memRecords);
      }
    } catch (err) {
      console.warn('Error uploading local data to remote Supabase:', err);
    }
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_MEMORIZED, JSON.stringify(this.memorizedPages));
      localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(this.sessions));
      localStorage.setItem(LOCAL_STORAGE_KEY_SESSION_PAGES, JSON.stringify(this.sessionPages));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(this.profile));
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getMemorizedPages(): MemorizedPage[] {
    return [...this.memorizedPages];
  }

  public getSessions(): StudySession[] {
    return [...this.sessions];
  }

  public getSessionPages(): SessionPage[] {
    return [...this.sessionPages];
  }

  public getProfile(): Profile {
    return { ...this.profile };
  }

  public updateProfile(newProfile: Partial<Profile>) {
    this.profile = { ...this.profile, ...newProfile };
    this.saveState();

    if (isSupabaseConfigured && supabase) {
      const sb = supabase;
      this.getActiveUserId().then(async (userId) => {
        if (isValidUUID(userId)) {
          try {
            await sb.from('profiles').upsert({
              id: userId,
              full_name: this.profile.full_name || 'Hifz Learner',
              week_start_day: this.profile.week_start_day,
              mushaf_layout: this.profile.mushaf_layout,
              timezone: this.profile.timezone,
              day_cutoff_hour: this.profile.day_cutoff_hour,
              stale_warning_days: this.profile.stale_warning_days,
              stale_critical_days: this.profile.stale_critical_days,
              default_daily_revision_pages: this.profile.default_daily_revision_pages
            });
          } catch (err) {
            console.warn('Supabase profile update warning:', err);
          }
        }
      });
    }
  }

  /**
   * Purges user ledger data from both local storage AND Supabase remote database (retaining profile settings)
   */
  public async clearToEmptyData() {
    const empty = getEmptyInitialData();
    this.memorizedPages = empty.memorizedPages;
    this.sessions = empty.sessions;
    this.sessionPages = empty.sessionPages;
    this.saveState();

    if (isSupabaseConfigured && supabase) {
      try {
        const userId = await this.getActiveUserId();
        if (isValidUUID(userId)) {
          const sb = supabase;

          // 1. Delete session_pages for user's study sessions
          const { data: userSessions } = await sb
            .from('study_sessions')
            .select('id')
            .eq('user_id', userId);

          if (userSessions && userSessions.length > 0) {
            const sessionIds = userSessions.map(s => s.id);
            const { error: pageErr } = await sb
              .from('session_pages')
              .delete()
              .in('session_id', sessionIds);
            if (pageErr) console.warn('Supabase purge session_pages error:', pageErr);
          }

          // 2. Delete study_sessions for user
          const { error: sessErr } = await sb
            .from('study_sessions')
            .delete()
            .eq('user_id', userId);
          if (sessErr) console.warn('Supabase purge study_sessions error:', sessErr);

          // 3. Delete memorized_pages for user
          const { error: memErr } = await sb
            .from('memorized_pages')
            .delete()
            .eq('user_id', userId);
          if (memErr) console.warn('Supabase purge memorized_pages error:', memErr);

          console.log('✅ Successfully purged remote Supabase ledger data for user:', userId);
        }
      } catch (err) {
        console.error('❌ Supabase clearToEmptyData purge error:', err);
      }
    }
  }

  public loadSampleSeedData() {
    const seed = getSampleSeedData();
    this.memorizedPages = seed.memorizedPages;
    this.sessions = seed.sessions;
    this.sessionPages = seed.sessionPages;
    this.saveState();
  }

  public async logSession(
    type: SessionType,
    pageNumbers: number[],
    stumbledPages: number[],
    notes: string = ''
  ): Promise<StudySession> {
    const userId = await this.getActiveUserId();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const loggedAt = new Date().toISOString();

    const newSession: StudySession = {
      id: sessionId,
      user_id: userId,
      type,
      logged_at: loggedAt,
      notes: notes || null
    };

    const newSessionPages: SessionPage[] = pageNumbers.map(p => ({
      session_id: sessionId,
      page_number: p,
      stumbled: stumbledPages.includes(p)
    }));

    let updatedMemorizedPages = [...this.memorizedPages];

    if (type === 'memorize') {
      const existingMemSet = new Set(this.memorizedPages.map(m => m.page_number));
      pageNumbers.forEach(p => {
        if (!existingMemSet.has(p)) {
          updatedMemorizedPages.push({
            user_id: userId,
            page_number: p,
            memorized_at: loggedAt
          });
        }
      });
    }

    this.memorizedPages = updatedMemorizedPages;
    this.sessions = [...this.sessions, newSession];
    this.sessionPages = [...this.sessionPages, ...newSessionPages];

    this.saveState();

    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const sb = supabase;

        await sb.from('profiles').upsert({
          id: userId,
          full_name: this.profile.full_name || 'Hifz Learner',
          week_start_day: this.profile.week_start_day,
          mushaf_layout: this.profile.mushaf_layout,
          timezone: this.profile.timezone,
          day_cutoff_hour: this.profile.day_cutoff_hour,
          stale_warning_days: this.profile.stale_warning_days,
          stale_critical_days: this.profile.stale_critical_days,
          default_daily_revision_pages: this.profile.default_daily_revision_pages
        });

        const { data: sessData, error: sessErr } = await sb
          .from('study_sessions')
          .insert({
            user_id: userId,
            type: type,
            logged_at: loggedAt,
            notes: notes || null
          })
          .select('id')
          .single();

        if (sessErr) {
          console.error('❌ Supabase study_sessions insert error:', sessErr.message, sessErr);
        } else if (sessData) {
          console.log('✅ Supabase study_sessions inserted with ID:', sessData.id);

          const remoteSessionPages = pageNumbers.map(p => ({
            session_id: sessData.id,
            page_number: p,
            stumbled: stumbledPages.includes(p)
          }));
          const { error: pageErr } = await sb.from('session_pages').insert(remoteSessionPages);
          if (pageErr) {
            console.error('❌ Supabase session_pages insert error:', pageErr.message, pageErr);
          } else {
            console.log(`✅ Supabase session_pages inserted ${pageNumbers.length} pages.`);
          }

          if (type === 'memorize') {
            const remoteMem = pageNumbers.map(p => ({
              user_id: userId,
              page_number: p,
              memorized_at: loggedAt
            }));
            const { error: memErr } = await sb.from('memorized_pages').upsert(remoteMem);
            if (memErr) {
              console.error('❌ Supabase memorized_pages upsert error:', memErr.message, memErr);
            }
          }
        }
      } catch (err) {
        console.error('❌ Supabase remote session log catch error:', err);
      }
    }

    return newSession;
  }

  public async toggleMemorizedPages(pageNumbers: number[], markMemorized: boolean) {
    const userId = await this.getActiveUserId();
    const pagesSet = new Set(pageNumbers);

    if (markMemorized) {
      const existing = new Set(this.memorizedPages.map(m => m.page_number));
      const now = new Date().toISOString();
      const updated = [...this.memorizedPages];
      pageNumbers.forEach(p => {
        if (!existing.has(p)) {
          updated.push({
            user_id: userId,
            page_number: p,
            memorized_at: now
          });
        }
      });
      this.memorizedPages = updated;

      if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
        try {
          const remoteRecords = pageNumbers.map(p => ({
            user_id: userId,
            page_number: p,
            memorized_at: now
          }));
          const { error } = await supabase.from('memorized_pages').upsert(remoteRecords);
          if (error) console.error('❌ Supabase memorized_pages upsert error:', error);
        } catch (e) {
          console.error('❌ Supabase memorized_pages upsert error:', e);
        }
      }
    } else {
      this.memorizedPages = this.memorizedPages.filter(m => !pagesSet.has(m.page_number));

      if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
        try {
          const { error } = await supabase
            .from('memorized_pages')
            .delete()
            .eq('user_id', userId)
            .in('page_number', pageNumbers);
          if (error) console.error('❌ Supabase memorized_pages delete error:', error);
        } catch (e) {
          console.error('❌ Supabase memorized_pages delete error:', e);
        }
      }
    }
    this.saveState();
  }

  public exportData(): RABTExportData {
    return {
      version: '1.0',
      appName: 'RABT',
      exportedAt: new Date().toISOString(),
      profile: { ...this.profile },
      memorizedPages: [...this.memorizedPages],
      sessions: [...this.sessions],
      sessionPages: [...this.sessionPages]
    };
  }

  public async importData(
    data: any,
    mode: 'replace' | 'merge' = 'merge'
  ): Promise<{
    success: boolean;
    message: string;
    counts: { memorized: number; sessions: number; sessionPages: number };
  }> {
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        message: 'Invalid JSON payload format.',
        counts: { memorized: 0, sessions: 0, sessionPages: 0 }
      };
    }

    const importedMemPages: MemorizedPage[] = Array.isArray(data.memorizedPages) ? data.memorizedPages : [];
    const importedSessions: StudySession[] = Array.isArray(data.sessions) ? data.sessions : [];
    const importedSessionPages: SessionPage[] = Array.isArray(data.sessionPages) ? data.sessionPages : [];
    const importedProfile: Partial<Profile> = data.profile && typeof data.profile === 'object' ? data.profile : {};

    const userId = await this.getActiveUserId();

    const normalizedMem = importedMemPages
      .map(m => ({
        ...m,
        user_id: userId,
        page_number: Number(m.page_number)
      }))
      .filter(m => !isNaN(m.page_number) && m.page_number >= 1 && m.page_number <= 848);

    const normalizedSessions = importedSessions
      .map(s => ({
        ...s,
        user_id: userId
      }))
      .filter(s => Boolean(s.id));

    const normalizedSessionPages = importedSessionPages
      .map(sp => ({
        ...sp,
        page_number: Number(sp.page_number)
      }))
      .filter(sp => Boolean(sp.session_id));

    if (mode === 'replace') {
      this.memorizedPages = normalizedMem;
      this.sessions = normalizedSessions;
      this.sessionPages = normalizedSessionPages;
      if (Object.keys(importedProfile).length > 0) {
        this.profile = { ...DEFAULT_PROFILE, ...importedProfile, id: userId };
      }
    } else {
      // Merge mode
      // 1. Memorized pages union by page_number
      const existingMemMap = new Map<number, MemorizedPage>();
      this.memorizedPages.forEach(m => existingMemMap.set(m.page_number, m));
      normalizedMem.forEach(m => {
        if (!existingMemMap.has(m.page_number)) {
          existingMemMap.set(m.page_number, m);
        }
      });
      this.memorizedPages = Array.from(existingMemMap.values());

      // 2. Sessions union by session id
      const existingSessMap = new Map<string, StudySession>();
      this.sessions.forEach(s => existingSessMap.set(s.id, s));
      normalizedSessions.forEach(s => {
        if (!existingSessMap.has(s.id)) {
          existingSessMap.set(s.id, s);
        }
      });
      this.sessions = Array.from(existingSessMap.values());

      // 3. Session pages union by session_id + page_number
      const existingSessPagesMap = new Map<string, SessionPage>();
      this.sessionPages.forEach(sp => existingSessPagesMap.set(`${sp.session_id}_${sp.page_number}`, sp));
      normalizedSessionPages.forEach(sp => {
        const key = `${sp.session_id}_${sp.page_number}`;
        if (!existingSessPagesMap.has(key)) {
          existingSessPagesMap.set(key, sp);
        }
      });
      this.sessionPages = Array.from(existingSessPagesMap.values());

      // Merge profile fields if present
      if (Object.keys(importedProfile).length > 0) {
        this.profile = { ...this.profile, ...importedProfile, id: userId };
      }
    }

    this.saveState();

    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      this.uploadLocalDataToRemote(userId).catch(err => {
        console.warn('Supabase sync after import error:', err);
      });
    }

    return {
      success: true,
      message: `Successfully imported data in ${mode} mode.`,
      counts: {
        memorized: normalizedMem.length,
        sessions: normalizedSessions.length,
        sessionPages: normalizedSessionPages.length
      }
    };
  }
}

export const globalStore = new RABTStore();
