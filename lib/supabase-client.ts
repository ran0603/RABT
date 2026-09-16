import { createClient } from '@supabase/supabase-js';
import { MemorizedPage, StudySession, SessionPage, SessionType } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.includes('supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export interface AuthUser {
  id: string; // Valid UUID
  email: string;
  fullName: string;
}

const LOCAL_AUTH_USER_KEY = 'rabt_current_user';
export const DEFAULT_USER_UUID = 'e8b8c59f-24d1-4a8e-9905-64019a12a321';

export function generateValidUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(uuidStr: string | null | undefined): boolean {
  if (!uuidStr) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuidStr);
}

export function getLocalUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCAL_AUTH_USER_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && isValidUUID(parsed.id)) {
        return parsed;
      } else if (parsed) {
        // Migration: Fix non-UUID id to valid UUID
        const fixed = { ...parsed, id: generateValidUUID() };
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(fixed));
        return fixed;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setLocalUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    const validUser = {
      ...user,
      id: isValidUUID(user.id) ? user.id : generateValidUUID()
    };
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(validUser));
  } else {
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
  }
}

/**
 * Fetches all user retention records from Supabase across all devices
 */
export async function fetchRemoteUserData(userId: string) {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return null;

  try {
    // 1. Fetch Profile
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn('Supabase fetch profiles warning:', profileErr);
    }

    // 2. Fetch Memorized Pages
    const { data: memData, error: memErr } = await supabase
      .from('memorized_pages')
      .select('user_id, page_number, memorized_at')
      .eq('user_id', userId);

    if (memErr) {
      console.warn('Supabase fetch memorized_pages warning:', memErr);
    }

    // 3. Fetch Study Sessions
    const { data: sessData, error: sessErr } = await supabase
      .from('study_sessions')
      .select('id, user_id, type, logged_at, notes')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });

    if (sessErr) {
      console.warn('Supabase fetch study_sessions warning:', sessErr);
    }

    let sessionPagesData: SessionPage[] = [];

    if (sessData && sessData.length > 0) {
      const sessionIds = sessData.map(s => s.id);
      const { data: pagesData, error: pagesErr } = await supabase
        .from('session_pages')
        .select('session_id, page_number, stumbled')
        .in('session_id', sessionIds);

      if (pagesErr) {
        console.warn('Supabase fetch session_pages warning:', pagesErr);
      } else if (pagesData) {
        sessionPagesData = pagesData.map(p => ({
          session_id: p.session_id,
          page_number: p.page_number,
          stumbled: p.stumbled ?? false
        }));
      }
    }

    const memorizedPages: MemorizedPage[] = (memData || []).map(m => ({
      user_id: m.user_id,
      page_number: m.page_number,
      memorized_at: m.memorized_at
    }));

    const studySessions: StudySession[] = (sessData || []).map(s => ({
      id: s.id,
      user_id: s.user_id,
      type: s.type as SessionType,
      logged_at: s.logged_at,
      notes: s.notes
    }));

    return {
      profile: profileData,
      memorizedPages,
      sessions: studySessions,
      sessionPages: sessionPagesData
    };
  } catch (err) {
    console.warn('Error fetching remote user data from Supabase:', err);
    return null;
  }
}
