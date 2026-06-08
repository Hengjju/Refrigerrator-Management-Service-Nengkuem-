import { FoodIcon } from './FoodIcon';
import type { StoredFoodItem } from '../../types/ingredient';

export interface ItemDetailFormValues {
  name: string;
  expiryDate: string;
  memo: string;
}

interface ItemDetailPanelProps {
  item: StoredFoodItem;
  values: ItemDetailFormValues;
  onChange: (values: ItemDetailFormValues) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function getTodayDateInputValue() {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000);

  return localToday.toISOString().slice(0, 10);
}

// 식재료 카드 클릭 시 열리는 상세 수정 패널입니다.
// 이름, 유통기한, 메모, 삭제처럼 한 식재료의 상세 관리 기능을 담당합니다.
export function ItemDetailPanel({ item, values, onChange, onSave, onDelete, onClose }: ItemDetailPanelProps) {
  const minExpiryDate = getTodayDateInputValue();

  const handleExpiryDateChange = (nextExpiryDate: string) => {
    if (nextExpiryDate && nextExpiryDate < minExpiryDate) return;

    onChange({ ...values, expiryDate: nextExpiryDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-sky-300 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-center gap-2 border-b border-sky-100 pb-4">
          <FoodIcon
            emoji={item.emoji}
            iconSrc={item.iconSrc}
            name={item.customName || item.name}
            emojiClassName="text-5xl"
            imageClassName="h-16 w-16 object-contain"
          />
          <h3 className="text-lg font-bold text-sky-700">식재료 상세 수정</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="item-name-input">
              표시 이름
            </label>
            <input
              id="item-name-input"
              type="text"
              value={values.name}
              onChange={(event) => onChange({ ...values, name: event.target.value })}
              className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder={item.name}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="item-expiry-input">
              유통기한
            </label>
            <input
              id="item-expiry-input"
              type="date"
              min={minExpiryDate}
              value={values.expiryDate}
              onChange={(event) => handleExpiryDateChange(event.target.value)}
              className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="item-memo-input">
              메모
            </label>
            <textarea
              id="item-memo-input"
              value={values.memo}
              onChange={(event) => onChange({ ...values, memo: event.target.value })}
              className="h-24 w-full resize-none rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder="보관 위치나 조리 계획을 적어보세요."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="mt-5 w-full rounded-lg border-2 border-red-500 bg-white py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
        >
          삭제
        </button>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-gray-400 bg-white py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-lg border-2 border-sky-500 bg-white py-2 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-50"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
