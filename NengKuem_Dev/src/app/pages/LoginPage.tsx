import { useState, type FormEvent } from 'react';

interface LoginPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

// 로그인 전 첫 화면입니다.
// 실제 인증 API가 붙기 전까지는 입력값을 받은 뒤 대시보드로 이동하는 UI 흐름만 담당합니다.
export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLogin, setRememberLogin] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      <img
        src="/brand/login-fridge.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vh,760px)] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.14] drop-shadow-2xl"
      />

      <section className="relative z-10 flex w-full max-w-[980px] flex-col overflow-hidden rounded-3xl border-2 border-sky-200 bg-white/88 shadow-2xl backdrop-blur-md md:grid md:grid-cols-[1fr_420px]">
        <div className="relative hidden min-h-[560px] overflow-hidden bg-sky-600 md:block">
          <img
            src="/brand/login-fridge.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-[-70px] left-1/2 w-[85%] -translate-x-1/2 opacity-35 drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/40 via-sky-600/80 to-sky-800/90" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div>
              <h1 className="text-5xl font-bold tracking-normal" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
                냉큼
              </h1>
              <p className="mt-3 text-sm font-bold text-sky-100">냉장고를 더 쉽게 정리하는 시간</p>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/12 p-4 shadow-lg backdrop-blur-sm">
              <p className="text-sm font-bold leading-6 text-white/95">오늘 넣은 식재료부터 유통기한까지 한 화면에서 관리하세요.</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[620px] flex-col justify-center px-6 py-8 sm:px-10 md:min-h-[560px] md:px-9">
          <div className="mb-8 text-center md:text-left">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-sky-200 bg-sky-50 shadow-sm md:mx-0">
              <img src="/brand/login-fridge.png" alt="냉큼" className="h-20 w-20 object-contain opacity-70" />
            </div>
            <h2 className="text-4xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
              냉큼
            </h2>
            <p className="mt-2 text-sm font-bold text-gray-500">로그인</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sky-700">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nengkuem@example.com"
                className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sky-700">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호 입력"
                className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <label className="flex items-center gap-2 text-gray-500">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(event) => setRememberLogin(event.target.checked)}
                  className="h-4 w-4 rounded border-sky-300 accent-sky-600"
                />
                로그인 유지
              </label>
              <button type="button" className="text-sky-600 transition-colors hover:text-sky-700">
                비밀번호 찾기
              </button>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-sky-600 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.99]"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
            <span>처음이신가요?</span>
            <button type="button" onClick={onRegister} className="text-sky-600 transition-colors hover:text-sky-700">
              회원가입
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
