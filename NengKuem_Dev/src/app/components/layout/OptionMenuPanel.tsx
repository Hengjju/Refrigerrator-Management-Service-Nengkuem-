export type OptionMenuItemId = 'dashboard' | 'foodGuide' | 'recipes' | 'history';

interface OptionMenuItem {
  id: OptionMenuItemId;
  label: string;
}

interface OptionMenuPanelProps {
  isOpen: boolean;
  activeItemId: OptionMenuItemId;
  onSelectItem: (itemId: OptionMenuItemId) => void;
  onClose: () => void;
}

const OPTION_MENU_ITEMS: OptionMenuItem[] = [
  { id: 'dashboard', label: '냉장고 현황' },
  { id: 'foodGuide', label: '식재료 도감' },
  { id: 'recipes', label: '레시피 추천' },
  { id: 'history', label: '보관 기록' },
];

// 왼쪽 상단 옵션 버튼을 눌렀을 때 열리는 앱 주요 메뉴 패널입니다.
export function OptionMenuPanel({ isOpen, activeItemId, onSelectItem, onClose }: OptionMenuPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/35" onClick={onClose}>
      <aside
        className="flex h-full w-[min(280px,82vw)] flex-col border-r-2 border-sky-200 bg-white p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-sky-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
              냉큼
            </h2>
            <p className="mt-1 text-xs font-bold text-gray-400">메뉴</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-lg font-bold text-sky-600 transition-colors hover:bg-sky-100"
            aria-label="옵션 메뉴 닫기"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {OPTION_MENU_ITEMS.map((item) => {
            const isActive = activeItemId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition-all ${
                  isActive
                    ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                    : 'border-sky-100 bg-white text-gray-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
