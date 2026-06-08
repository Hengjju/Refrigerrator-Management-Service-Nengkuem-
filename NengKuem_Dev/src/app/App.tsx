import { useState } from 'react';

import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

type AppView = 'login' | 'register' | 'dashboard';

// 인증 API가 붙기 전까지 로그인, 회원가입, 대시보드 화면 전환만 담당하는 앱 루트입니다.
export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');

  if (currentView === 'register') {
    return (
      <RegisterPage
        onBackToLogin={() => setCurrentView('login')}
        onRegister={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'dashboard') {
    return <DashboardPage />;
  }

  return (
    <LoginPage
      onLogin={() => setCurrentView('dashboard')}
      onRegister={() => setCurrentView('register')}
    />
  );
}
