import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import './styles/index.css';

// 브라우저 주소에 맞춰 로그인, 회원가입, 대시보드 화면을 보여주도록 라우터로 감쌉니다.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);