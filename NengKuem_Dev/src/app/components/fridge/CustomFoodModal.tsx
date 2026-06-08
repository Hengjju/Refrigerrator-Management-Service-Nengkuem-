import { useEffect, useState } from 'react';

import { FoodIcon } from './FoodIcon';
import type { StorageSection } from '../../types/ingredient';

interface IconOption {
  emoji: string;
  defaultName: string;
  iconSrc?: string;
}

interface IconCategory {
  id: string;
  label: string;
  icons: IconOption[];
}

interface CustomFoodModalProps {
  isOpen: boolean;
  onCreate: (name: string, emoji: string, section: StorageSection, iconSrc?: string) => void;
  onClose: () => void;
}

const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'vegetable',
    label: '채소',
    icons: [
      { emoji: '🌿', defaultName: '대파', iconSrc: '/food-icons/green-onion.svg' },
      { emoji: '🧄', defaultName: '마늘' },
      { emoji: '🧅', defaultName: '양파' },
      { emoji: '🥬', defaultName: '배추' },
      { emoji: '🥬', defaultName: '김치', iconSrc: '/food-icons/kimchi.svg' },
      { emoji: '🍅', defaultName: '토마토' },
      { emoji: '🥕', defaultName: '당근' },
      { emoji: '🥒', defaultName: '오이' },
      { emoji: '🥒', defaultName: '애호박', iconSrc: '/food-icons/zucchini.svg' },
      { emoji: '🥔', defaultName: '감자' },
      { emoji: '🍄', defaultName: '버섯' },
      { emoji: '⚪', defaultName: '무', iconSrc: '/food-icons/radish.svg' },
      { emoji: '🌶️', defaultName: '고추' },
    ],
  },
  {
    id: 'fruit',
    label: '과일',
    icons: [
      { emoji: '🍎', defaultName: '사과' },
      { emoji: '🍌', defaultName: '바나나' },
      { emoji: '🍊', defaultName: '오렌지' },
      { emoji: '🍇', defaultName: '포도' },
      { emoji: '🍓', defaultName: '딸기' },
      { emoji: '🍑', defaultName: '복숭아' },
      { emoji: '🍍', defaultName: '파인애플' },
      { emoji: '🥝', defaultName: '키위' },
    ],
  },
  {
    id: 'meat',
    label: '육류',
    icons: [
      { emoji: '🥩', defaultName: '소고기' },
      { emoji: '🥩', defaultName: '돼지고기' },
      { emoji: '🍗', defaultName: '닭고기' },
      { emoji: '🥓', defaultName: '베이컨' },
    ],
  },
  {
    id: 'seafood',
    label: '해산물',
    icons: [
      { emoji: '🐟', defaultName: '생선' },
      { emoji: '🦐', defaultName: '새우' },
      { emoji: '🦑', defaultName: '오징어' },
      { emoji: '🦀', defaultName: '게' },
      { emoji: '🐙', defaultName: '문어' },
      { emoji: '🦪', defaultName: '굴' },
    ],
  },
  {
    id: 'dairy',
    label: '유제품',
    icons: [
      { emoji: '🥚', defaultName: '달걀' },
      { emoji: '🥛', defaultName: '우유' },
      { emoji: '🧀', defaultName: '치즈' },
      { emoji: '🧈', defaultName: '버터' },
    ],
  },
  {
    id: 'grain',
    label: '곡류',
    icons: [
      { emoji: '🍚', defaultName: '밥' },
      { emoji: '🌾', defaultName: '쌀' },
      { emoji: '🍞', defaultName: '식빵' },
      { emoji: '🍜', defaultName: '면' },
      { emoji: '🌽', defaultName: '옥수수' },
    ],
  },
  {
    id: 'etc',
    label: '기타',
    icons: [
      { emoji: '◻️', defaultName: '두부', iconSrc: '/food-icons/tofu.svg' },
      { emoji: '🥫', defaultName: '통조림' },
      { emoji: '🍯', defaultName: '꿀' },
      { emoji: '🧂', defaultName: '소금' },
      { emoji: '🍫', defaultName: '초콜릿' },
    ],
  },
];

const DEFAULT_ICON = ICON_CATEGORIES[0].icons[0];
const STORAGE_OPTIONS: { value: StorageSection; label: string }[] = [
  { value: 'fridge', label: '냉장' },
  { value: 'freezer', label: '냉동' },
];

// 기본 목록에 없는 식재료를 직접 만들어 바로 냉장 칸 또는 냉동 칸에 넣는 모달입니다.
export function CustomFoodModal({ isOpen, onCreate, onClose }: CustomFoodModalProps) {
  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ICON_CATEGORIES[0].id);
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(DEFAULT_ICON);
  const [selectedSection, setSelectedSection] = useState<StorageSection>('fridge');

  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setSelectedCategoryId(ICON_CATEGORIES[0].id);
    setSelectedIcon(DEFAULT_ICON);
    setSelectedSection('fridge');
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const selectedCategory = ICON_CATEGORIES.find((category) => category.id === selectedCategoryId) || ICON_CATEGORIES[0];

  const selectIcon = (icon: IconOption) => {
    setSelectedIcon(icon);
    setName(icon.defaultName);
  };

  const handleSubmit = () => {
    if (!trimmedName) return;

    onCreate(trimmedName, selectedIcon.emoji, selectedSection, selectedIcon.iconSrc);
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
              placeholder="아이콘을 누르면 이름이 자동 입력됩니다."
              autoFocus
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-gray-700">보관 위치</span>
              <span className="text-[10px] font-bold text-sky-500">{selectedSection === 'fridge' ? '냉장 칸' : '냉동 칸'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STORAGE_OPTIONS.map((option) => {
                const isActive = selectedSection === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedSection(option.value)}
                    className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition-colors ${
                      isActive
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-sky-100 bg-white text-gray-500 hover:border-sky-300 hover:text-sky-600'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
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
                      selectIcon(category.icons[0]);
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
                const isActive = selectedIcon.emoji === icon.emoji && selectedIcon.defaultName === icon.defaultName;

                return (
                  <button
                    key={`${icon.emoji}-${icon.defaultName}`}
                    type="button"
                    onClick={() => selectIcon(icon)}
                    className={`flex h-8 items-center justify-center rounded-lg border text-base transition-all ${
                      isActive
                        ? 'border-sky-400 bg-white shadow-sm ring-2 ring-sky-200'
                        : 'border-sky-100 bg-white/80 hover:border-sky-300 hover:bg-white'
                    }`}
                    aria-label={`${icon.defaultName} 아이콘 선택`}
                    title={icon.defaultName}
                  >
                    <FoodIcon
                      emoji={icon.emoji}
                      iconSrc={icon.iconSrc}
                      name={icon.defaultName}
                      emojiClassName="text-base"
                      imageClassName="h-6 w-6 object-contain"
                    />
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