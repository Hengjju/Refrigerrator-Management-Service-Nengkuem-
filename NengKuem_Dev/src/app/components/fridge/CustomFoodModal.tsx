import { useEffect, useState } from 'react';

interface IconCategory {
  id: string;
  label: string;
  icons: string[];
}

interface CustomFoodModalProps {
  isOpen: boolean;
  onCreate: (name: string, emoji: string) => void;
  onClose: () => void;
}

const ICON_CATEGORIES: IconCategory[] = [
  { id: 'vegetable', label: '채소', icons: ['🥬', '🍅', '🧅', '🥕', '🥒', '🥔', '🍆', '🌽', '🫑', '🧄'] },
  { id: 'fruit', label: '과일', icons: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍍', '🥝'] },
  { id: 'meat', label: '육류', icons: ['🥩', '🍗', '🥓', '🍖'] },
  { id: 'seafood', label: '해산물', icons: ['🐟', '🦐', '🦑', '🦀', '🐙', '🦪'] },
  { id: 'dairy', label: '유제품', icons: ['🥛', '🧀', '🥚', '🧈', '🍦'] },
  { id: 'grain', label: '곡류', icons: ['🍚', '🍞', '🥖', '🥐', '🌾', '🍜'] },
  { id: 'etc', label: '기타', icons: ['🍽️', '🍯', '🥫', '🧂', '🍫', '🍄'] },
];

const DEFAULT_ICON = ICON_CATEGORIES[0].icons[0];

// 기본 식재료 목록에 없는 식재료를 사용자가 직접 등록하는 입력 모달입니다.
export function CustomFoodModal({ isOpen, onCreate, onClose }: CustomFoodModalProps) {
  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ICON_CATEGORIES[0].id);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);

  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setSelectedCategoryId(ICON_CATEGORIES[0].id);
    setSelectedIcon(DEFAULT_ICON);
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const selectedCategory = ICON_CATEGORIES.find((category) => category.id === selectedCategoryId) || ICON_CATEGORIES[0];

  const handleSubmit = () => {
    if (!trimmedName) return;

    onCreate(trimmedName, selectedIcon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[320px] rounded-xl border-2 border-sky-300 bg-white p-3 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 border-b border-sky-100 pb-2 text-center">
          <h3 className="text-sm font-bold text-sky-700">식재료 추가</h3>
        </div>

        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-gray-700" htmlFor="custom-food-name-input">
              식재료 이름
            </label>
            <input
              id="custom-food-name-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border-2 border-sky-200 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-400"
              placeholder="예: 양파"
              autoFocus
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-gray-700">아이콘</span>
              <span className="max-w-[130px] truncate whitespace-nowrap text-[10px] font-bold text-sky-500">{selectedCategory.label}</span>
            </div>

            <div className="mb-1.5 flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {ICON_CATEGORIES.map((category) => {
                const isActive = selectedCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSelectedIcon(category.icons[0]);
                    }}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-bold transition-colors ${
                      isActive
                        ? 'border-sky-400 bg-sky-50 text-sky-700'
                        : 'border-sky-100 bg-white text-gray-500 hover:border-sky-300 hover:text-sky-600'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="grid max-h-24 grid-cols-5 gap-1 overflow-y-auto rounded-lg border border-sky-100 bg-sky-50/60 p-1.5">
              {selectedCategory.icons.map((icon) => {
                const isActive = selectedIcon === icon;

                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`flex h-8 items-center justify-center rounded-lg border text-base transition-all ${
                      isActive
                        ? 'border-sky-400 bg-white shadow-sm ring-2 ring-sky-200'
                        : 'border-sky-100 bg-white/80 hover:border-sky-300 hover:bg-white'
                    }`}
                    aria-label={`${icon} 아이콘 선택`}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 whitespace-nowrap rounded-lg border-2 border-gray-400 bg-white py-1.5 text-[11px] font-bold text-gray-500 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmedName}
            className="flex-1 whitespace-nowrap rounded-lg border-2 border-sky-500 bg-white py-1.5 text-[11px] font-bold text-sky-600 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
