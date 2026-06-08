import { useState } from 'react';

import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

// 앱의 첫 화면을 로그인으로 두고, 로그인 버튼을 누르면 기존 냉장고 대시보드로 전환합니다.
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <DashboardPage />;
}