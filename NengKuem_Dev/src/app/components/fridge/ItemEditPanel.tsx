import type { StoredFoodItem } from '../../types/ingredient';

interface ItemEditPanelProps {
  item: StoredFoodItem;
  nameValue: string;
  expiryDateValue: string;
  memoValue: string;
  onNameChange: (name: string) => void;
  onExpiryDateChange: (expiryDate: string) => void;
  onMemoChange: (memo: string) => void;
  onSave: () => void;
  onClose: () => void;
}

// 식재료 카드 클릭 시 열리는 간단한 상세 수정 패널입니다.
// 이름, 유통기한, 메모를 수정할 수 있고 이후 단계에서 삭제 기능까지 확장합니다.
export function ItemEditPanel({
  item,
  nameValue,
  expiryDateValue,
  memoValue,
  onNameChange,
  onExpiryDateChange,
  onMemoChange,
  onSave,
  onClose,
}: ItemEditPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-sky-300 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-center gap-2 border-b border-sky-100 pb-4">
          <span className="text-5xl">{item.emoji}</span>
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
              value={nameValue}
              onChange={(event) => onNameChange(event.target.value)}
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
              value={expiryDateValue}
              onChange={(event) => onExpiryDateChange(event.target.value)}
              className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="item-memo-input">
              메모
            </label>
            <textarea
              id="item-memo-input"
              value={memoValue}
              onChange={(event) => onMemoChange(event.target.value)}
              className="h-24 w-full resize-none rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder="보관 위치나 조리 계획을 적어보세요."
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
