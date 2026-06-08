import { useState, type DragEvent } from 'react';

import { AVAILABLE_FOODS } from '../constants/foodCategories';
import { CustomFoodModal } from '../components/fridge/CustomFoodModal';
import { ItemDetailPanel, type ItemDetailFormValues } from '../components/fridge/ItemDetailPanel';
import { StorageZone } from '../components/fridge/StorageZone';
import { OptionMenuPanel, type OptionMenuItemId } from '../components/layout/OptionMenuPanel';
import type { FoodItem } from '../types/food';
import type { StoredFoodItem, StorageSection } from '../types/ingredient';
import { getExpiryDdayInfo } from '../utils/expiryStatus';

const emptyDetailForm: ItemDetailFormValues = {
  name: '',
  expiryDate: '',
  memo: '',
};

type ExpiryFilter = 'all' | 'fresh' | 'today' | 'expired' | 'none';
type ExpirySort = 'default' | 'near' | 'far';

const EXPIRY_FILTER_OPTIONS: { value: ExpiryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'fresh', label: '남음' },
  { value: 'today', label: '오늘' },
  { value: 'expired', label: '만료' },
  { value: 'none', label: '미입력' },
];

const EXPIRY_SORT_OPTIONS: { value: ExpirySort; label: string }[] = [
  { value: 'default', label: '기본순' },
  { value: 'near', label: '가까운 순' },
  { value: 'far', label: '먼 순' },
];

function matchesExpiryFilter(item: StoredFoodItem, filter: ExpiryFilter) {
  if (filter === 'all') return true;

  const ddayInfo = getExpiryDdayInfo(item.expiryDate);

  if (filter === 'none') return !ddayInfo;
  if (filter === 'fresh') {
    return ddayInfo?.status === 'urgent' || ddayInfo?.status === 'soon' || ddayInfo?.status === 'plenty';
  }

  return ddayInfo?.status === filter;
}

function getExpirySortValue(item: StoredFoodItem) {
  if (!item.expiryDate) return null;

  const sortValue = new Date(`${item.expiryDate}T00:00:00`).getTime();

  return Number.isNaN(sortValue) ? null : sortValue;
}

function sortItemsByExpiry(items: StoredFoodItem[], sort: ExpirySort) {
  if (sort === 'default') return items;

  return [...items].sort((firstItem, secondItem) => {
    const firstDate = getExpirySortValue(firstItem);
    const secondDate = getExpirySortValue(secondItem);

    if (firstDate === null && secondDate === null) return 0;
    if (firstDate === null) return 1;
    if (secondDate === null) return -1;

    return sort === 'near' ? firstDate - secondDate : secondDate - firstDate;
  });
}

function createStoredItem(food: FoodItem, section: StorageSection): StoredFoodItem {
  return {
    ...food,
    uniqueId: `${section}-${food.id}-${Date.now()}`,
    section,
  };
}

// 메인 냉장고 화면입니다.
// 식재료를 원하는 칸에 드래그해서 추가하고, 상세 정보와 유통기한 표시를 관리합니다.
export function DashboardPage() {
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  const [expirySort, setExpirySort] = useState<ExpirySort>('default');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [activeOptionMenu, setActiveOptionMenu] = useState<OptionMenuItemId>('dashboard');
  const [dragOverSection, setDragOverSection] = useState<StorageSection | null>(null);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [freezerItems, setFreezerItems] = useState<StoredFoodItem[]>([]);
  const [fridgeItems, setFridgeItems] = useState<StoredFoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoredFoodItem | null>(null);
  const [detailForm, setDetailForm] = useState<ItemDetailFormValues>(emptyDetailForm);

  const foodCatalog = [...AVAILABLE_FOODS, ...customFoods];
  const activeSortLabel = EXPIRY_SORT_OPTIONS.find((option) => option.value === expirySort)?.label || '기본순';
  const filteredFreezerItems = sortItemsByExpiry(
    freezerItems.filter((item) => matchesExpiryFilter(item, expiryFilter)),
    expirySort,
  );
  const filteredFridgeItems = sortItemsByExpiry(
    fridgeItems.filter((item) => matchesExpiryFilter(item, expiryFilter)),
    expirySort,
  );
  const emptyStorageMessage = expiryFilter === 'all' ? '아직 등록된 식재료가 없습니다.' : '조건에 맞는 식재료가 없습니다.';

  const addFoodToSection = (food: FoodItem, section: StorageSection) => {
    const newItem = createStoredItem(food, section);

    if (section === 'freezer') {
      setFreezerItems((prevItems) => [...prevItems, newItem]);
      return;
    }

    setFridgeItems((prevItems) => [...prevItems, newItem]);
  };

  const handleFoodDragStart = (event: DragEvent<HTMLButtonElement>, food: FoodItem) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-nengkuem-food-id', food.id);
    event.dataTransfer.setData('text/plain', food.id);
  };

  const handleDropFood = (foodId: string, section: StorageSection) => {
    const food = foodCatalog.find((availableFood) => availableFood.id === foodId);
    setDragOverSection(null);

    if (!food) return;

    addFoodToSection(food, section);
  };

  const handleCreateCustomFood = (name: string, emoji: string) => {
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name,
      emoji,
    };

    setCustomFoods((prevFoods) => [...prevFoods, newFood]);
    setIsCustomFoodModalOpen(false);
  };

  const handleMoveStoredItem = (itemId: string, targetSection: StorageSection) => {
    const itemToMove = [...freezerItems, ...fridgeItems].find((item) => item.uniqueId === itemId);
    setDragOverSection(null);

    if (!itemToMove || itemToMove.section === targetSection) return;

    const movedItem: StoredFoodItem = { ...itemToMove, section: targetSection };

    if (itemToMove.section === 'freezer') {
      setFreezerItems((prevItems) => prevItems.filter((item) => item.uniqueId !== itemId));
    } else {
      setFridgeItems((prevItems) => prevItems.filter((item) => item.uniqueId !== itemId));
    }

    if (targetSection === 'freezer') {
      setFreezerItems((prevItems) => [...prevItems, movedItem]);
    } else {
      setFridgeItems((prevItems) => [...prevItems, movedItem]);
    }

    setSelectedItem((prevItem) => (prevItem?.uniqueId === itemId ? movedItem : prevItem));
  };

  const handleSelectItem = (item: StoredFoodItem) => {
    setSelectedItem(item);
    setDetailForm({
      name: item.customName || item.name,
      expiryDate: item.expiryDate || '',
      memo: item.memo || '',
    });
  };

  const handleCloseDetailPanel = () => {
    setSelectedItem(null);
    setDetailForm(emptyDetailForm);
  };

  const handleChangeExpiryFilter = (nextFilter: ExpiryFilter) => {
    setExpiryFilter(nextFilter);
    setIsSortMenuOpen(false);

    if (selectedItem && !matchesExpiryFilter(selectedItem, nextFilter)) {
      handleCloseDetailPanel();
    }
  };

  const handleChangeExpirySort = (nextSort: ExpirySort) => {
    setExpirySort(nextSort);
    setIsSortMenuOpen(false);
  };

  const handleSaveItemDetail = () => {
    if (!selectedItem) return;

    const nextName = detailForm.name.trim() || selectedItem.name;
    const nextExpiryDate = detailForm.expiryDate || undefined;
    const nextMemo = detailForm.memo.trim() || undefined;
    const updateItems = (items: StoredFoodItem[]) =>
      items.map((item) =>
        item.uniqueId === selectedItem.uniqueId
          ? { ...item, customName: nextName, expiryDate: nextExpiryDate, memo: nextMemo }
          : item,
      );

    if (selectedItem.section === 'freezer') {
      setFreezerItems(updateItems);
    } else {
      setFridgeItems(updateItems);
    }

    handleCloseDetailPanel();
  };

  const handleDeleteItem = (itemToDelete: StoredFoodItem) => {
    if (selectedItem?.uniqueId === itemToDelete.uniqueId) {
      handleCloseDetailPanel();
    }

    if (itemToDelete.section === 'freezer') {
      setFreezerItems((prevItems) =>
        prevItems.filter((item) => item.uniqueId !== itemToDelete.uniqueId),
      );
      return;
    }

    setFridgeItems((prevItems) =>
      prevItems.filter((item) => item.uniqueId !== itemToDelete.uniqueId),
    );
  };

  return (
    <div
      className="min-h-screen w-full overflow-auto bg-gradient-to-br from-sky-50 to-white p-3 sm:p-5 md:p-6 lg:p-8"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      <div className="mx-auto flex w-full max-w-[1320px] min-w-0 flex-col">
        <header className="mb-4 flex flex-shrink-0 items-center justify-between md:mb-5">
          <button
            type="button"
            onClick={() => setIsOptionMenuOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-sky-100"
            aria-label="옵션 메뉴 열기"
          >
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
          </button>

          <h1 className="text-2xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
            냉큼
          </h1>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg">
            <span className="block h-5 w-5 rounded-full border-2 border-sky-600" />
          </div>
        </header>

        <main className="h-[calc(100vh-104px)] min-h-[560px] max-h-[680px] rounded-2xl border-2 border-sky-700 bg-sky-600 p-3 shadow-xl sm:p-4 md:p-5 lg:p-6">
          <div className="grid h-full min-h-0 min-w-0 grid-cols-[clamp(108px,13vw,180px)_minmax(0,1fr)] gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <aside className="min-h-0 min-w-0">
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white p-2 shadow-lg sm:p-3 md:p-4">
                <div className="mb-3 text-center text-sm font-bold text-sky-600 sm:text-base md:text-lg">식재료</div>

                <div
                  className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto pr-0.5 scrollbar-hide sm:gap-3 sm:pr-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {foodCatalog.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      draggable
                      onDragStart={(event) => handleFoodDragStart(event, food)}
                      onDragEnd={() => setDragOverSection(null)}
                      className="flex min-h-[76px] cursor-grab flex-col items-center justify-center gap-1 rounded-xl border-2 border-sky-200 bg-white p-1.5 transition-all hover:border-sky-400 hover:shadow-md active:cursor-grabbing sm:min-h-[92px] md:min-h-[104px] md:p-2"
                      aria-label={`${food.name} 드래그해서 추가`}
                    >
                      <span className="text-xl sm:text-2xl md:text-3xl">{food.emoji}</span>
                      <span className="max-w-full truncate whitespace-nowrap px-1 text-[9px] font-medium text-gray-700 sm:text-[10px] md:text-[11px]">{food.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomFoodModalOpen(true)}
                  className="mt-3 flex h-10 flex-shrink-0 items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-sky-50 text-xs font-bold text-sky-600 transition-all hover:border-sky-400 hover:bg-white hover:shadow-sm"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="whitespace-nowrap">식재료 추가</span>
                </button>
              </div>
            </aside>

            <section className="min-h-0 min-w-0 overflow-hidden rounded-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-3 shadow-2xl sm:p-4 md:p-5 lg:p-6">
              <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4 md:gap-5">
                <div className="relative flex flex-shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-white/80 p-1.5 shadow-sm">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1 sm:justify-start sm:gap-1.5">
                    {EXPIRY_FILTER_OPTIONS.map((option) => {
                      const isActive = expiryFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChangeExpiryFilter(option.value)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors sm:px-3 sm:text-xs ${
                            isActive
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'text-sky-600 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex flex-shrink-0 items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-500 sm:text-xs">정렬</span>
                    <button
                      type="button"
                      onClick={() => setIsSortMenuOpen((prevOpen) => !prevOpen)}
                      className="flex min-w-[82px] items-center justify-between gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 sm:min-w-[94px] sm:px-3 sm:text-xs"
                      aria-expanded={isSortMenuOpen}
                    >
                      <span>{activeSortLabel}</span>
                      <span className={`transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>

                    {isSortMenuOpen && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-28 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-lg">
                        {EXPIRY_SORT_OPTIONS.map((option) => {
                          const isActive = expirySort === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleChangeExpirySort(option.value)}
                              className={`block w-full px-3 py-2 text-left text-[10px] font-bold transition-colors sm:text-xs ${
                                isActive
                                  ? 'bg-emerald-500 text-white'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <StorageZone
                  section="freezer"
                  title="냉동 칸"
                  items={filteredFreezerItems}
                  selectedItemId={selectedItem?.uniqueId}
                  emptyMessage={emptyStorageMessage}
                  isDragOver={dragOverSection === 'freezer'}
                  onDragEnterSection={setDragOverSection}
                  onDragLeaveSection={() => setDragOverSection(null)}
                  onDropFood={handleDropFood}
                  onDropStoredItem={handleMoveStoredItem}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                />
                <StorageZone
                  section="fridge"
                  title="냉장 칸"
                  items={filteredFridgeItems}
                  selectedItemId={selectedItem?.uniqueId}
                  emptyMessage={emptyStorageMessage}
                  isDragOver={dragOverSection === 'fridge'}
                  onDragEnterSection={setDragOverSection}
                  onDragLeaveSection={() => setDragOverSection(null)}
                  onDropFood={handleDropFood}
                  onDropStoredItem={handleMoveStoredItem}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      <OptionMenuPanel
        isOpen={isOptionMenuOpen}
        activeItemId={activeOptionMenu}
        onSelectItem={setActiveOptionMenu}
        onClose={() => setIsOptionMenuOpen(false)}
      />

      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onCreate={handleCreateCustomFood}
        onClose={() => setIsCustomFoodModalOpen(false)}
      />

      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          values={detailForm}
          onChange={setDetailForm}
          onSave={handleSaveItemDetail}
          onDelete={() => handleDeleteItem(selectedItem)}
          onClose={handleCloseDetailPanel}
        />
      )}
    </div>
  );
}
