import type { DragEvent } from 'react';

import type { StoredFoodItem, StorageSection } from '../../types/ingredient';
import { formatExpiryDate, getExpiryDdayInfo, type ExpiryStatus } from '../../utils/expiryStatus';

interface StorageZoneProps {
  section: StorageSection;
  title: string;
  items: StoredFoodItem[];
  selectedItemId?: string | null;
  emptyMessage?: string;
  isDragOver?: boolean;
  onDragEnterSection?: (section: StorageSection) => void;
  onDragLeaveSection?: (section: StorageSection) => void;
  onDropFood?: (foodId: string, section: StorageSection) => void;
  onSelectItem: (item: StoredFoodItem) => void;
  onDeleteItem: (item: StoredFoodItem) => void;
}

function getCardToneClass(status?: ExpiryStatus) {
  if (status === 'expired') return 'border-red-300 bg-red-50/80';
  if (status === 'today') return 'border-orange-300 bg-orange-50/80';
  if (status === 'urgent') return 'border-amber-300 bg-amber-50/80';
  if (status === 'soon') return 'border-yellow-300 bg-yellow-50/80';
  if (status === 'plenty') return 'border-emerald-300 bg-emerald-50/80';

  return 'border-sky-200 bg-white';
}

function getDdayBadgeClass(status: ExpiryStatus) {
  if (status === 'expired') return 'border-red-200 bg-red-50 text-red-600';
  if (status === 'today') return 'border-orange-200 bg-orange-50 text-orange-600';
  if (status === 'urgent') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'soon') return 'border-yellow-200 bg-yellow-50 text-yellow-700';

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function getStatusLabelClass(status: ExpiryStatus) {
  if (status === 'expired') return 'bg-red-100 text-red-600';
  if (status === 'today') return 'bg-orange-100 text-orange-600';
  if (status === 'urgent') return 'bg-amber-100 text-amber-700';
  if (status === 'soon') return 'bg-yellow-100 text-yellow-700';

  return 'bg-emerald-100 text-emerald-700';
}

// 냉동 칸과 냉장 칸을 공통으로 표현하는 보관 칸 컴포넌트입니다.
// 식재료 목록에서 끌어온 항목을 이 영역에 놓으면 해당 칸에 추가됩니다.
export function StorageZone({
  section,
  title,
  items,
  selectedItemId,
  emptyMessage = '아직 등록된 식재료가 없습니다.',
  isDragOver = false,
  onDragEnterSection,
  onDragLeaveSection,
  onDropFood,
  onSelectItem,
  onDeleteItem,
}: StorageZoneProps) {
  const hasItems = items.length > 0;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFood) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    onDragEnterSection?.(section);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    onDragLeaveSection?.(section);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFood) return;

    event.preventDefault();

    const foodId = event.dataTransfer.getData('application/x-nengkuem-food-id') || event.dataTransfer.getData('text/plain');
    onDragLeaveSection?.(section);

    if (foodId) {
      onDropFood(foodId, section);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-0 flex-1 flex-col rounded-xl border-2 p-3 transition-all sm:p-4 md:p-5 ${
        isDragOver ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_0_3px_rgba(52,211,153,0.35)]' : 'border-sky-300 bg-sky-50'
      }`}
    >
      <h2 className="mb-3 flex-shrink-0 text-center text-xl font-bold text-sky-600 sm:text-2xl md:mb-4 md:text-3xl">{title}</h2>
      <div
        className={`min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-dashed p-3 transition-colors sm:p-4 ${
          isDragOver ? 'border-emerald-300 bg-emerald-50/80' : 'border-sky-200 bg-white/70'
        }`}
      >
        {hasItems ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const displayName = item.customName || item.name;
              const expiryDateLabel = formatExpiryDate(item.expiryDate);
              const ddayInfo = getExpiryDdayInfo(item.expiryDate);
              const isSelected = selectedItemId === item.uniqueId;
              const cardStateClass = `${getCardToneClass(ddayInfo?.status)} ${
                isSelected ? 'shadow-md ring-2 ring-sky-300' : ''
              }`;
              const expiryDateClass = ddayInfo ? getStatusLabelClass(ddayInfo.status) : 'bg-sky-50 text-sky-600';

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
                  className={`relative flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 transition-all hover:border-sky-400 hover:shadow-md sm:min-h-[120px] ${cardStateClass}`}
                >
                  {ddayInfo && (
                    <span
                      className={`absolute left-1 top-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${getDdayBadgeClass(
                        ddayInfo.status,
                      )}`}
                    >
                      {ddayInfo.label}
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
                  <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
                    {expiryDateLabel && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${expiryDateClass}`}>
                        {expiryDateLabel}
                      </span>
                    )}
                    {ddayInfo && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getStatusLabelClass(ddayInfo.status)}`}>
                        {ddayInfo.statusLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm font-medium text-sky-500 sm:text-base md:text-lg">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
