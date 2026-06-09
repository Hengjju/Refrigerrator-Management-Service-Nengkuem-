import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// 로그인 상태에 따라 인증 화면과 냉장고 화면의 접근 흐름을 정리합니다.
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginNoticeMessage, setLoginNoticeMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoginNoticeMessage('');
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleOpenRegister = () => {
    setLoginNoticeMessage('');
    navigate('/register');
  };

  const handleRegister = () => {
    setIsLoggedIn(false);
    setLoginNoticeMessage('가입이 완료되었습니다.');
    navigate('/login');
  };

  const handleBackToLogin = () => {
    setLoginNoticeMessage('');
    navigate('/login');
  };

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
        element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
