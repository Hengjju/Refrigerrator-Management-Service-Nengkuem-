import { useState, type FormEvent } from 'react';

import type { RegisterRequest } from '../api/authApi';

interface RegisterPageProps {
  onBackToLogin: () => void;
  onRegister: (values: RegisterRequest) => Promise<void>;
}

// 회원가입 화면입니다.
// 입력 상태를 검증한 뒤 Supabase 회원가입 API 호출을 App에 요청합니다.
export function RegisterPage({ onBackToLogin, onRegister }: RegisterPageProps) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim() || !passwordConfirm.trim()) {
      setFormMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setFormMessage('비밀번호는 6자리 이상으로 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setFormMessage('비밀번호가 서로 달라요.');
      return;
    }

    if (!agreeTerms) {
      setFormMessage('약관 동의가 필요합니다.');
      return;
    }

    setFormMessage('');
    setIsSubmitting(true);

    try {
      await onRegister({
        nickname: trimmedNickname,
        email: trimmedEmail,
        password,
      });
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : '회원가입 중 문제가 생겼습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vh,780px)] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.12] drop-shadow-2xl"
      />

      <section className="relative z-10 flex w-full max-w-[1020px] flex-col overflow-hidden rounded-3xl border-2 border-sky-200 bg-white/90 shadow-2xl backdrop-blur-md md:grid md:grid-cols-[420px_1fr]">
        <div className="relative hidden min-h-[600px] overflow-hidden bg-sky-600 md:block">
          <img
            src="/brand/login-fridge.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-[-80px] left-1/2 w-[90%] -translate-x-1/2 opacity-30 drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/35 via-sky-600/80 to-emerald-700/80" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div>
              <h1 className="text-5xl font-bold tracking-normal" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
                냉큼
              </h1>
              <p className="mt-3 text-sm font-bold text-sky-100">나만의 냉장고를 시작해요</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/30 bg-white/12 p-4 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-bold leading-6 text-white/95">계정을 만들면 식재료와 레시피를 사용자별로 관리할 수 있어요.</p>
              </div>
              <button
                type="button"
                onClick={onBackToLogin}
                className="h-11 w-full rounded-2xl border border-white/40 bg-white/15 text-sm font-bold text-white transition-colors hover:bg-white/25"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-[680px] flex-col justify-center px-6 py-7 sm:px-10 md:min-h-[600px] md:px-10">
          <div className="mb-7 text-center md:text-left">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-sky-200 bg-sky-50 shadow-sm md:mx-0">
              <img src="/brand/login-fridge.png" alt="냉큼" className="h-20 w-20 object-contain opacity-70" />
            </div>
            <h2 className="text-4xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
              냉큼
            </h2>
            <p className="mt-2 text-sm font-bold text-gray-500">회원가입</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sky-700">닉네임</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setFormMessage('');
                }}
                placeholder="냉장고 이름 또는 닉네임"
                className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sky-700">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFormMessage('');
                }}
                placeholder="nengkuem@example.com"
                className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-sky-700">비밀번호</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFormMessage('');
                  }}
                  placeholder="비밀번호"
                  className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-sky-700">비밀번호 확인</span>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => {
                    setPasswordConfirm(event.target.value);
                    setFormMessage('');
                  }}
                  placeholder="한 번 더 입력"
                  className="h-12 w-full rounded-2xl border-2 border-sky-100 bg-sky-50/50 px-4 text-sm font-bold text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-sky-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3">
              <label className="flex items-start gap-2 text-xs font-bold leading-5 text-gray-500">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => {
                    setAgreeTerms(event.target.checked);
                    setFormMessage('');
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-sky-300 accent-sky-600"
                />
                냉큼 이용약관과 개인정보 처리방침에 동의합니다.
              </label>
            </div>

            {formMessage && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">{formMessage}</p>
            )}

            <button
              type="submit"
              disabled={!agreeTerms || isSubmitting}
              className="h-12 w-full rounded-2xl bg-sky-600 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 md:hidden">
            <span>이미 계정이 있나요?</span>
            <button type="button" onClick={onBackToLogin} className="text-sky-600 transition-colors hover:text-sky-700">
              로그인
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
