import { createRoot } from 'react-dom/client';

import App from './app/App';
import './styles/index.css';

// 앱의 가장 처음 실행 지점입니다.
// 초기 버전에서는 라우터 없이 App 화면을 바로 렌더링합니다.
createRoot(document.getElementById('root')!).render(<App />);
