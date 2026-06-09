import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const AUTH_REMEMBER_KEY = 'nengkuem-auth-remember';

const isBrowser = () => typeof window !== 'undefined';

// 로그인 유지 체크 여부에 따라 Supabase 세션을 localStorage 또는 sessionStorage에 저장합니다.
const getPreferredStorage = () => {
  if (!isBrowser()) return null;

  return window.localStorage.getItem(AUTH_REMEMBER_KEY) === 'false'
    ? window.sessionStorage
    : window.localStorage;
};

const authStorage = {
  getItem(key: string) {
    if (!isBrowser()) return null;

    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    const storage = getPreferredStorage();
    if (!storage || !isBrowser()) return;

    storage.setItem(key, value);

    const otherStorage = storage === window.localStorage ? window.sessionStorage : window.localStorage;
    otherStorage.removeItem(key);
  },
  removeItem(key: string) {
    if (!isBrowser()) return;

    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const setAuthRememberPreference = (shouldRememberLogin: boolean) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(AUTH_REMEMBER_KEY, shouldRememberLogin ? 'true' : 'false');
};

export const clearAuthRememberPreference = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(AUTH_REMEMBER_KEY);
};

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: authStorage,
      },
    })
  : null;
