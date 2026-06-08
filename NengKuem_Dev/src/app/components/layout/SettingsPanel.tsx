interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 오른쪽 상단 톱니바퀴 버튼에서 열리는 계정/로그인 설정 패널입니다.
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/35" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-[min(320px,86vw)] flex-col border-l-2 border-sky-200 bg-white p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-sky-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-sky-600">설정</h2>
            <p className="mt-1 text-xs font-bold text-gray-400">로그인 설정</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-lg font-bold text-sky-600 transition-colors hover:bg-sky-100"
            aria-label="설정 닫기"
          >
            ×
          </button>
        </div>

        <section className="rounded-xl border-2 border-sky-100 bg-sky-50/70 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-lg font-bold text-sky-600">
              N
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-700">게스트 사용자</p>
              <p className="mt-0.5 truncate text-xs font-bold text-gray-400">로그인 전</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-400"
            >
              사용자 변경
            </button>
            <button
              type="button"
              disabled
              className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-400"
            >
              로그아웃하기
            </button>
          </div>
        </section>

        <section className="mt-3 rounded-xl border-2 border-sky-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-gray-700">로그인 연동</span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600">
              준비중
            </span>
          </div>
        </section>
      </aside>
    </div>
  );
}