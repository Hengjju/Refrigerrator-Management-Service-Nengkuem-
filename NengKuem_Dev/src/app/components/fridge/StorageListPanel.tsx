import { useEffect, useMemo, useState } from 'react';

import { FoodIcon } from './FoodIcon';
import type { StoredFoodItem, StorageSection } from '../../types/ingredient';
import { formatExpiryDate, getExpiryDdayInfo, type ExpiryStatus } from '../../utils/expiryStatus';

interface StorageListPanelProps {
  section: StorageSection;
  title: string;
  items: StoredFoodItem[];
  onSelectItem: (item: StoredFoodItem) => void;
  onDeleteItems: (section: StorageSection, itemIds: string[]) => void | Promise<void>;
  onClose: () => void;
}

function getSectionLabel(section: StorageSection) {
  return section === 'freezer' ? '냉동 칸' : '냉장 칸';
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

// 한 보관 칸에 들어 있는 식재료를 리스트로 보고, 선택 삭제까지 처리하는 패널입니다.
export function StorageListPanel({ section, title, items, onSelectItem, onDeleteItems, onClose }: StorageListPanelProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectableIds = useMemo(() => items.map((item) => item.uniqueId), [items]);
  const isAllSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;

  useEffect(() => {
    setIsSelectMode(false);
    setSelectedIds([]);
  }, [section]);

  useEffect(() => {
    setSelectedIds((prevIds) => prevIds.filter((itemId) => selectableIds.includes(itemId)));
  }, [selectableIds]);

  const toggleSelectMode = () => {
    setIsSelectMode((prevMode) => !prevMode);
    setSelectedIds([]);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedIds((prevIds) =>
      prevIds.includes(itemId) ? prevIds.filter((selectedId) => selectedId !== itemId) : [...prevIds, itemId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : selectableIds);
  };

  const handleDeleteSelectedItems = async () => {
    if (selectedIds.length === 0) return;

    await onDeleteItems(section, selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3" onClick={onClose}>
      <section
        className="flex max-h-[min(720px,92vh)] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-sky-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-sky-700">{title} 전체</h2>
            <p className="mt-0.5 truncate text-xs font-bold text-gray-400">
              {getSectionLabel(section)} 식재료 {items.length}개
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-lg font-bold text-sky-600 transition-colors hover:bg-sky-100"
            aria-label={`${title} 전체 목록 닫기`}
          >
            x
          </button>
        </header>

        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-sky-50 px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={toggleSelectMode}
            className={`rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
              isSelectMode
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-sky-200 bg-white text-sky-600 hover:bg-sky-50'
            }`}
          >
            선택
          </button>

          {isSelectMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={items.length === 0}
                className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedItems}
                disabled={selectedIds.length === 0}
                className="rounded-lg border-2 border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-sky-100 bg-sky-50 px-4 text-center">
              <p className="text-sm font-bold text-sky-500">아직 등록된 식재료가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {items.map((item) => {
                const displayName = item.customName || item.name;
                const ddayInfo = getExpiryDdayInfo(item.expiryDate);
                const isSelected = selectedIds.includes(item.uniqueId);
                const expiryDateLabel = formatExpiryDate(item.expiryDate) || '유통기한 미입력';
                const expiryDateClass = ddayInfo ? getStatusLabelClass(ddayInfo.status) : 'bg-sky-50 text-sky-600';

                return (
                  <button
                    key={item.uniqueId}
                    type="button"
                    onClick={() => {
                      if (isSelectMode) {
                        toggleItemSelection(item.uniqueId);
                        return;
                      }

                      onSelectItem(item);
                    }}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50 shadow-sm'
                        : 'border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/60'
                    }`}
                  >
                    {isSelectMode ? (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 text-[10px] font-bold ${
                          isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-sky-200 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    ) : (
                      <FoodIcon
                        emoji={item.emoji}
                        iconSrc={item.iconSrc}
                        name={displayName}
                        emojiClassName="text-2xl"
                        imageClassName="h-8 w-8 object-contain"
                      />
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">{displayName}</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-gray-400">
                        {item.memo || '메모 없음'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-wrap justify-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${expiryDateClass}`}>
                          {expiryDateLabel}
                        </span>
                        {ddayInfo && (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getDdayBadgeClass(ddayInfo.status)}`}>
                            {ddayInfo.label}
                          </span>
                        )}
                      </div>
                      {ddayInfo && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusLabelClass(ddayInfo.status)}`}>
                          {ddayInfo.statusLabel}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}