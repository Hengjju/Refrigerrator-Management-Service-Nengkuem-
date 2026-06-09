import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import {
  getCurrentSession,
  signInWithEmail,
  signOutOfSupabase,
  signUpWithEmail,
  subscribeAuthState,
  type LoginRequest,
  type RegisterRequest,
} from './api/authApi';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AuthLoadingScreen() {
  return (
    <main
      className="flex min-h-[100dvh] w-full items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      <section className="flex min-h-[220px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border-2 border-sky-200 bg-white/90 p-8 text-center shadow-xl">
        <img src="/brand/login-fridge.png" alt="냉큼" className="mb-4 h-20 w-20 object-contain opacity-70" />
        <h1 className="text-3xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
          냉큼
        </h1>
        <p className="mt-3 text-sm font-bold text-gray-500">로그인 상태를 확인하고 있어요.</p>
      </section>
    </main>
  );
}

// Supabase 세션을 기준으로 로그인 화면과 냉장고 화면의 접근 흐름을 정리합니다.
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginNoticeMessage, setLoginNoticeMessage] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = Boolean(session);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((currentSession) => {
        if (isMounted) {
          setSession(currentSession);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const unsubscribe = subscribeAuthState((nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async (values: LoginRequest) => {
    setLoginNoticeMessage('');
    const nextSession = await signInWithEmail(values);
    setSession(nextSession);
    navigate('/dashboard');
  };

  const handleOpenRegister = () => {
    setLoginNoticeMessage('');
    navigate('/register');
  };

  const handleRegister = async (values: RegisterRequest) => {
    await signUpWithEmail(values);
    await signOutOfSupabase();
    setSession(null);
    setLoginNoticeMessage('가입이 완료되었습니다.');
    navigate('/login');
  };

  const handleBackToLogin = () => {
    setLoginNoticeMessage('');
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await signOutOfSupabase();
    } finally {
      setSession(null);
      setLoginNoticeMessage('');
      navigate('/login', { replace: true });
    }
  };

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              noticeMessage={loginNoticeMessage}
              onLogin={handleLogin}
              onRegister={handleOpenRegister}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage onBackToLogin={handleBackToLogin} onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
