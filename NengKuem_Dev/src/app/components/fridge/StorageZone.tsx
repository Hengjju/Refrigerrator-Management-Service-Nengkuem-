import type { StoredFoodItem, StorageSection } from '../../types/ingredient';

interface StorageZoneProps {
  section: StorageSection;
  title: string;
  items: StoredFoodItem[];
  selectedItemId?: string | null;
  onSelectItem: (item: StoredFoodItem) => void;
  onDeleteItem: (item: StoredFoodItem) => void;
}

function formatExpiryDate(expiryDate?: string) {
  if (!expiryDate) return null;

  return expiryDate.replaceAll('-', '.');
}

// 냉동 칸과 냉장 칸을 공통으로 표현하는 보관 칸 컴포넌트입니다.
// 저장된 유통기한이 있으면 식재료 카드 아래에 날짜를 작게 표시합니다.
export function StorageZone({ title, items, selectedItemId, onSelectItem, onDeleteItem }: StorageZoneProps) {
  const hasItems = items.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border-2 border-sky-300 bg-sky-50 p-3 sm:p-4 md:p-5">
      <h2 className="mb-3 flex-shrink-0 text-center text-xl font-bold text-sky-600 sm:text-2xl md:mb-4 md:text-3xl">{title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-dashed border-sky-200 bg-white/70 p-3 sm:p-4">
        {hasItems ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const displayName = item.customName || item.name;
              const expiryDateLabel = formatExpiryDate(item.expiryDate);
              const isSelected = selectedItemId === item.uniqueId;

              return (
                <div
                  key={item.uniqueId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectItem(item);
                    }
                  }}
                  className={`relative flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 bg-white p-2 transition-all hover:border-sky-400 hover:shadow-md sm:min-h-[100px] ${
                    isSelected ? 'border-sky-500 shadow-md' : 'border-sky-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteItem(item);
                    }}
                    className="absolute right-1 top-1 h-5 w-5 rounded-full border border-red-300 bg-white text-[10px] font-bold text-red-500 transition-colors hover:bg-red-50"
                    aria-label={`${displayName} 삭제`}
                  >
                    ×
                  </button>
                  <span className="text-xl sm:text-2xl">{item.emoji}</span>
                  <span className="max-w-full truncate text-[10px] font-medium text-gray-700 sm:text-[11px]">{displayName}</span>
                  {expiryDateLabel && (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-sky-600">
                      {expiryDateLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm font-medium text-sky-500 sm:text-base md:text-lg">아직 등록된 식재료가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
