import type { Session } from '@supabase/supabase-js';

import {
  clearAuthRememberPreference,
  setAuthRememberPreference,
  supabase,
} from './supabaseClient';

export interface LoginRequest {
  email: string;
  password: string;
  rememberLogin: boolean;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
}

const SUPABASE_CONFIG_MESSAGE =
  'Supabase 설정값이 없습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 넣어주세요.';

const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIG_MESSAGE);
  }

  return supabase;
};

// Supabase의 영문 오류를 앱에서 바로 이해할 수 있는 한국어 문장으로 바꿉니다.
const getFriendlyAuthErrorMessage = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return '로그인 정보가 올바르지 않습니다.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return '이메일 인증이 필요합니다. 가입한 메일함을 확인해주세요.';
  }

  if (normalizedMessage.includes('user already registered') || normalizedMessage.includes('already registered')) {
    return '이미 가입된 이메일입니다.';
  }

  if (normalizedMessage.includes('password') && normalizedMessage.includes('characters')) {
    return '비밀번호는 6자리 이상으로 입력해주세요.';
  }

  if (normalizedMessage.includes('rate limit')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  return '인증 처리 중 문제가 생겼습니다. 입력값을 확인한 뒤 다시 시도해주세요.';
};

export const getCurrentSession = async () => {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;

  return data.session;
};

export const subscribeAuthState = (onChange: (session: Session | null) => void) => {
  if (!supabase) return () => undefined;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session);
  });

  return () => data.subscription.unsubscribe();
};

export const signInWithEmail = async ({ email, password, rememberLogin }: LoginRequest) => {
  const client = getSupabaseClient();
  setAuthRememberPreference(rememberLogin);

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error.message));
  }

  if (!data.session) {
    throw new Error('로그인 세션을 만들지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  return data.session;
};

export const signUpWithEmail = async ({ nickname, email, password }: RegisterRequest) => {
  const client = getSupabaseClient();

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error.message));
  }
};

export const signOutOfSupabase = async () => {
  if (!supabase) {
    clearAuthRememberPreference();
    return;
  }

  const { error } = await supabase.auth.signOut();
  clearAuthRememberPreference();

  if (error) {
    throw new Error('로그아웃 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.');
  }
};
