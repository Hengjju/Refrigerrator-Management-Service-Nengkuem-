import { useEffect, useState } from 'react';

interface CustomFoodModalProps {
  isOpen: boolean;
  onCreate: (name: string, emoji: string) => void;
  onClose: () => void;
}

// 기본 식재료 목록에 없는 식재료를 사용자가 직접 등록하는 입력 모달입니다.
export function CustomFoodModal({ isOpen, onCreate, onClose }: CustomFoodModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setEmoji('');
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const trimmedEmoji = emoji.trim();

  const handleSubmit = () => {
    if (!trimmedName) return;

    onCreate(trimmedName, trimmedEmoji || '🍽️');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-sky-300 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 border-b border-sky-100 pb-4 text-center">
          <h3 className="text-lg font-bold text-sky-700">식재료 추가</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="custom-food-name-input">
              식재료 이름
            </label>
            <input
              id="custom-food-name-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder="예: 양파"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="custom-food-emoji-input">
              아이콘
            </label>
            <input
              id="custom-food-emoji-input"
              type="text"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder="비우면 기본 아이콘 사용"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-gray-400 bg-white py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmedName}
            className="flex-1 rounded-lg border-2 border-sky-500 bg-white py-2 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
