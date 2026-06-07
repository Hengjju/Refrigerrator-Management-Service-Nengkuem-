import type { StoredFoodItem, StorageSection } from '../../types/ingredient';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

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

function getLocalDateStart(dateText: string) {
  const [year, month, day] = dateText.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getExpiryDdayLabel(expiryDate?: string) {
  if (!expiryDate) return null;

  const expiry = getLocalDateStart(expiryDate);
  if (!expiry) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = Math.round((expiry.getTime() - today.getTime()) / DAY_IN_MS);

  if (daysLeft < 0) return null;
  if (daysLeft === 0) return 'D-day';

  return `D-${daysLeft}`;
}

// 냉동 칸과 냉장 칸을 공통으로 표현하는 보관 칸 컴포넌트입니다.
// 저장된 유통기한이 있으면 식재료 카드에 날짜와 D-day 정보를 함께 표시합니다.
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
              const ddayLabel = getExpiryDdayLabel(item.expiryDate);
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
                  className={`relative flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 bg-white p-2 transition-all hover:border-sky-400 hover:shadow-md sm:min-h-[112px] ${
                    isSelected ? 'border-sky-500 shadow-md' : 'border-sky-200'
                  }`}
                >
                  {ddayLabel && (
                    <span
                      className={`absolute left-1 top-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${
                        ddayLabel === 'D-day'
                          ? 'border-orange-200 bg-orange-50 text-orange-600'
                          : 'border-sky-200 bg-sky-50 text-sky-600'
                      }`}
                    >
                      {ddayLabel}
                    </span>
                  )}
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
