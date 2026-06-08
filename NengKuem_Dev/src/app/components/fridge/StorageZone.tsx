import type { DragEvent } from 'react';

import { FoodIcon } from './FoodIcon';
import type { StoredFoodItem, StorageSection } from '../../types/ingredient';
import { formatExpiryDate, getExpiryDdayInfo, type ExpiryStatus } from '../../utils/expiryStatus';

const FOOD_DRAG_TYPE = 'application/x-nengkuem-food-id';
const STORED_ITEM_DRAG_TYPE = 'application/x-nengkuem-stored-item-id';

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
  onDropStoredItem?: (itemId: string, section: StorageSection) => void;
  onSelectItem: (item: StoredFoodItem) => void;
  onDeleteItem: (item: StoredFoodItem) => void;
  onOpenList?: (section: StorageSection) => void;
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
// 왼쪽 식재료는 새로 추가하고, 이미 들어간 식재료는 다른 칸으로 이동할 수 있습니다.
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
  onDropStoredItem,
  onSelectItem,
  onDeleteItem,
  onOpenList,
}: StorageZoneProps) {
  const hasItems = items.length > 0;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFood && !onDropStoredItem) return;

    event.preventDefault();

    const draggedTypes = Array.from(event.dataTransfer.types);
    event.dataTransfer.dropEffect = draggedTypes.includes(STORED_ITEM_DRAG_TYPE) ? 'move' : 'copy';
    onDragEnterSection?.(section);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    onDragLeaveSection?.(section);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!onDropFood && !onDropStoredItem) return;

    event.preventDefault();

    const itemId = event.dataTransfer.getData(STORED_ITEM_DRAG_TYPE);
    const foodId = event.dataTransfer.getData(FOOD_DRAG_TYPE) || event.dataTransfer.getData('text/plain');
    onDragLeaveSection?.(section);

    if (itemId) {
      onDropStoredItem?.(itemId, section);
      return;
    }

    if (foodId) {
      onDropFood?.(foodId, section);
    }
  };

  const handleStoredItemDragStart = (event: DragEvent<HTMLDivElement>, item: StoredFoodItem) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(STORED_ITEM_DRAG_TYPE, item.uniqueId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-0 flex-1 flex-col rounded-xl border-2 p-2 transition-all sm:p-4 md:p-5 ${
        isDragOver ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_0_3px_rgba(52,211,153,0.35)]' : 'border-sky-300 bg-sky-50'
      }`}
    >
      <div className="mb-2 grid flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center sm:mb-3 md:mb-4">
        <span aria-hidden="true" />
        <h2 className="text-center text-xl font-bold text-sky-600 sm:text-2xl md:text-3xl">{title}</h2>
        {onOpenList && (
          <button
            type="button"
            onClick={() => onOpenList(section)}
            className="justify-self-end rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-[10px] font-bold text-sky-600 transition-colors hover:bg-sky-50 sm:text-xs"
          >
            전체
          </button>
        )}
      </div>
      <div
        className={`min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-dashed p-2 transition-colors sm:p-4 ${
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
                  draggable
                  onClick={() => onSelectItem(item)}
                  onDragStart={(event) => handleStoredItemDragStart(event, item)}
                  onDragEnd={() => onDragLeaveSection?.(section)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectItem(item);
                    }
                  }}
                  className={`relative flex min-h-[104px] cursor-grab flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 transition-all hover:border-sky-400 hover:shadow-md active:cursor-grabbing sm:min-h-[120px] ${cardStateClass}`}
                  aria-label={`${displayName} 선택 또는 다른 칸으로 이동`}
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
                  <FoodIcon
                    emoji={item.emoji}
                    iconSrc={item.iconSrc}
                    name={displayName}
                    emojiClassName="text-xl sm:text-2xl"
                    imageClassName="h-8 w-8 object-contain sm:h-9 sm:w-9"
                  />
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
