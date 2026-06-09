import { useEffect, useMemo, useRef, useState, type DragEvent, type TouchEvent as ReactTouchEvent } from 'react';

import { AVAILABLE_FOODS } from '../constants/foodCategories';
import { CustomFoodModal } from '../components/fridge/CustomFoodModal';
import { FoodIcon } from '../components/fridge/FoodIcon';
import { ItemDetailPanel, type ItemDetailFormValues } from '../components/fridge/ItemDetailPanel';
import { StorageListPanel } from '../components/fridge/StorageListPanel';
import { StorageZone } from '../components/fridge/StorageZone';
import { RecipeListPanel } from '../components/recipe/RecipeListPanel';
import { OptionMenuPanel, type OptionMenuItemId } from '../components/layout/OptionMenuPanel';
import { SettingsPanel } from '../components/layout/SettingsPanel';
import type { FoodItem } from '../types/food';
import type { StoredFoodItem, StorageSection } from '../types/ingredient';
import type { RecipeIngredientInput } from '../types/recipe';
import { getExpiryDdayInfo } from '../utils/expiryStatus';
import {
  createIngredientItem,
  deleteIngredientItems,
  fetchUserIngredients,
  updateIngredientItem,
} from '../api/ingredientApi';

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

const FOOD_DRAG_TYPE = 'application/x-nengkuem-food-id';
const STORED_ITEM_DRAG_TYPE = 'application/x-nengkuem-stored-item-id';
const TOUCH_DRAG_THRESHOLD = 8;
const TOUCH_DRAG_DELAY = 250;

type MobileDragBase = {
  touchId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  label: string;
  emoji: string;
  iconSrc?: string;
};

type MobileFoodDrag = MobileDragBase & {
  type: 'food';
  foodId: string;
};

type MobileStoredDrag = MobileDragBase & {
  type: 'stored';
  item: StoredFoodItem;
};

type MobileDragPreview = MobileFoodDrag | MobileStoredDrag;

type MobileDragActions = {
  dropFood: (foodId: string, section: StorageSection) => void | Promise<void>;
  moveStoredItem: (itemId: string, section: StorageSection) => void | Promise<void>;
  deleteItem: (item: StoredFoodItem) => void | Promise<void>;
};

function getStorageSectionFromPoint(x: number, y: number): StorageSection | null {
  if (typeof document === 'undefined') return null;

  const storageElement = document
    .elementsFromPoint(x, y)
    .map((element) => (element instanceof HTMLElement ? element.closest('[data-storage-section]') : null))
    .find((element): element is HTMLElement => element instanceof HTMLElement);
  const section = storageElement?.dataset.storageSection;

  return section === 'freezer' || section === 'fridge' ? section : null;
}

function getTouchById(touches: TouchList, touchId: number) {
  for (let index = 0; index < touches.length; index += 1) {
    const touch = touches.item(index);

    if (touch?.identifier === touchId) return touch;
  }

  return null;
}

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


function getDashboardErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

function splitItemsBySection(items: StoredFoodItem[]) {
  return {
    freezer: items.filter((item) => item.section === 'freezer'),
    fridge: items.filter((item) => item.section === 'fridge'),
  };
}

interface DashboardPageProps {
  onLogout: () => void | Promise<void>;
}

// 메인 냉장고 화면입니다.
// 식재료를 원하는 칸에 드래그해서 추가하고, 상세 정보와 유통기한 표시를 관리합니다.
export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  const [expirySort, setExpirySort] = useState<ExpirySort>('default');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isRecipePanelOpen, setIsRecipePanelOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [activeOptionMenu, setActiveOptionMenu] = useState<OptionMenuItemId>('dashboard');
  const [dragOverSection, setDragOverSection] = useState<StorageSection | null>(null);
  const [activeListSection, setActiveListSection] = useState<StorageSection | null>(null);
  const [freezerItems, setFreezerItems] = useState<StoredFoodItem[]>([]);
  const [fridgeItems, setFridgeItems] = useState<StoredFoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoredFoodItem | null>(null);
  const [detailForm, setDetailForm] = useState<ItemDetailFormValues>(emptyDetailForm);
  const [mobileDragPreview, setMobileDragPreview] = useState<MobileDragPreview | null>(null);
  const [isIngredientStorageLoading, setIsIngredientStorageLoading] = useState(true);
  const [ingredientStorageMessage, setIngredientStorageMessage] = useState('');
  const pendingMobileDragRef = useRef<MobileDragPreview | null>(null);
  const activeMobileDragRef = useRef<MobileDragPreview | null>(null);
  const mobileDragTimerRef = useRef<number | null>(null);
  const mobileDragActionsRef = useRef<MobileDragActions | null>(null);
  const suppressSelectAfterDragRef = useRef(false);

  const foodCatalog = AVAILABLE_FOODS;
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
  const activeListItems = activeListSection === 'freezer' ? freezerItems : fridgeItems;
  const activeListTitle = activeListSection === 'freezer' ? '냉동 칸' : '냉장 칸';
  const recipeIngredients: RecipeIngredientInput[] = useMemo(
    () => [...fridgeItems, ...freezerItems].map((item) => ({
      id: item.uniqueId,
      name: item.customName || item.name,
    })),
    [fridgeItems, freezerItems],
  );

  useEffect(() => {
    let isActive = true;

    setIsIngredientStorageLoading(true);
    setIngredientStorageMessage('');

    fetchUserIngredients()
      .then((items) => {
        if (!isActive) return;

        const nextItems = splitItemsBySection(items);
        setFreezerItems(nextItems.freezer);
        setFridgeItems(nextItems.fridge);
      })
      .catch((error) => {
        if (!isActive) return;

        setIngredientStorageMessage(
          getDashboardErrorMessage(error, '식재료 저장소를 불러오지 못했습니다.'),
        );
      })
      .finally(() => {
        if (isActive) {
          setIsIngredientStorageLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const addSavedItemToState = (item: StoredFoodItem) => {
    if (item.section === 'freezer') {
      setFreezerItems((prevItems) => [...prevItems, item]);
      return;
    }

    setFridgeItems((prevItems) => [...prevItems, item]);
  };

  const syncSavedItemInState = (savedItem: StoredFoodItem) => {
    const syncSectionItems = (items: StoredFoodItem[], section: StorageSection) => {
      const itemsWithoutSavedItem = items.filter((item) => item.uniqueId !== savedItem.uniqueId);

      if (savedItem.section !== section) {
        return itemsWithoutSavedItem;
      }

      const originalIndex = items.findIndex((item) => item.uniqueId === savedItem.uniqueId);
      if (originalIndex === -1) {
        return [...itemsWithoutSavedItem, savedItem];
      }

      const nextItems = [...itemsWithoutSavedItem];
      nextItems.splice(originalIndex, 0, savedItem);
      return nextItems;
    };

    setFreezerItems((prevItems) => syncSectionItems(prevItems, 'freezer'));
    setFridgeItems((prevItems) => syncSectionItems(prevItems, 'fridge'));
    setSelectedItem((prevItem) => (prevItem?.uniqueId === savedItem.uniqueId ? savedItem : prevItem));
  };

  const removeItemsFromState = (itemIds: string[]) => {
    setFreezerItems((prevItems) => prevItems.filter((item) => !itemIds.includes(item.uniqueId)));
    setFridgeItems((prevItems) => prevItems.filter((item) => !itemIds.includes(item.uniqueId)));
  };

  const addFoodToSection = async (food: FoodItem, section: StorageSection) => {
    try {
      setIngredientStorageMessage('');
      const newItem = await createIngredientItem(food, section);
      addSavedItemToState(newItem);
      return true;
    } catch (error) {
      setIngredientStorageMessage(
        getDashboardErrorMessage(error, '식재료를 저장하지 못했습니다.'),
      );
      return false;
    }
  };

  const handleFoodDragStart = (event: DragEvent<HTMLButtonElement>, food: FoodItem) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(FOOD_DRAG_TYPE, food.id);
    event.dataTransfer.setData('text/plain', food.id);
  };

  const handleDropFood = (foodId: string, section: StorageSection) => {
    const food = foodCatalog.find((availableFood) => availableFood.id === foodId);
    setDragOverSection(null);

    if (!food) return;

    void addFoodToSection(food, section);
  };

  const handleCreateCustomFood = async (name: string, emoji: string, section: StorageSection, iconSrc?: string) => {
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name,
      emoji,
      iconSrc,
    };

    const didCreate = await addFoodToSection(newFood, section);
    if (didCreate) {
      setIsCustomFoodModalOpen(false);
    }
  };

  const handleMoveStoredItem = async (itemId: string, targetSection: StorageSection) => {
    const itemToMove = [...freezerItems, ...fridgeItems].find((item) => item.uniqueId === itemId);
    setDragOverSection(null);

    if (!itemToMove || itemToMove.section === targetSection) return;

    try {
      setIngredientStorageMessage('');
      const movedItem = await updateIngredientItem(itemId, { section: targetSection });
      syncSavedItemInState(movedItem);
    } catch (error) {
      setIngredientStorageMessage(
        getDashboardErrorMessage(error, '식재료 위치를 저장하지 못했습니다.'),
      );
    }
  };

  const handleSelectItem = (item: StoredFoodItem) => {
    if (suppressSelectAfterDragRef.current) {
      suppressSelectAfterDragRef.current = false;
      return;
    }

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
  const handleSelectOptionMenu = (itemId: OptionMenuItemId) => {
    setActiveOptionMenu(itemId);
    setIsOptionMenuOpen(false);

    if (itemId === 'recipes') {
      setIsRecipePanelOpen(true);
    }
  };

  const handleSaveItemDetail = async () => {
    if (!selectedItem) return;

    const nextName = detailForm.name.trim() || selectedItem.name;
    const nextExpiryDate = detailForm.expiryDate || undefined;
    const nextMemo = detailForm.memo.trim() || undefined;

    try {
      setIngredientStorageMessage('');
      const savedItem = await updateIngredientItem(selectedItem.uniqueId, {
        section: selectedItem.section,
        customName: nextName,
        expiryDate: nextExpiryDate,
        memo: nextMemo,
      });
      syncSavedItemInState(savedItem);
      handleCloseDetailPanel();
    } catch (error) {
      setIngredientStorageMessage(
        getDashboardErrorMessage(error, '식재료 상세 정보를 저장하지 못했습니다.'),
      );
    }
  };

  const handleDeleteItems = async (_section: StorageSection, itemIds: string[]) => {
    if (itemIds.length === 0) return;

    try {
      setIngredientStorageMessage('');
      await deleteIngredientItems(itemIds);

      if (selectedItem && itemIds.includes(selectedItem.uniqueId)) {
        handleCloseDetailPanel();
      }

      removeItemsFromState(itemIds);
    } catch (error) {
      setIngredientStorageMessage(
        getDashboardErrorMessage(error, '선택한 식재료를 삭제하지 못했습니다.'),
      );
    }
  };

  const handleDeleteItem = async (itemToDelete: StoredFoodItem) => {
    try {
      setIngredientStorageMessage('');
      await deleteIngredientItems([itemToDelete.uniqueId]);

      if (selectedItem?.uniqueId === itemToDelete.uniqueId) {
        handleCloseDetailPanel();
      }

      removeItemsFromState([itemToDelete.uniqueId]);
    } catch (error) {
      setIngredientStorageMessage(
        getDashboardErrorMessage(error, '식재료를 삭제하지 못했습니다.'),
      );
    }
  };

  mobileDragActionsRef.current = {
    dropFood: handleDropFood,
    moveStoredItem: handleMoveStoredItem,
    deleteItem: handleDeleteItem,
  };

  const clearMobileDragTimer = () => {
    if (mobileDragTimerRef.current === null) return;

    window.clearTimeout(mobileDragTimerRef.current);
    mobileDragTimerRef.current = null;
  };

  const startLongPressMobileDrag = (dragPreview: MobileDragPreview) => {
    clearMobileDragTimer();
    pendingMobileDragRef.current = dragPreview;
    mobileDragTimerRef.current = window.setTimeout(() => {
      const pendingDrag = pendingMobileDragRef.current;

      if (!pendingDrag || pendingDrag.touchId !== dragPreview.touchId) return;

      activeMobileDragRef.current = pendingDrag;
      setMobileDragPreview(pendingDrag);
      setDragOverSection(getStorageSectionFromPoint(pendingDrag.x, pendingDrag.y));
    }, TOUCH_DRAG_DELAY);
  };

  const handleFoodTouchStart = (event: ReactTouchEvent<HTMLButtonElement>, food: FoodItem) => {
    if (event.touches.length !== 1) return;

    const touch = event.changedTouches.item(0) || event.touches.item(0);

    if (!touch) return;

    startLongPressMobileDrag({
      type: 'food',
      touchId: touch.identifier,
      foodId: food.id,
      label: food.name,
      emoji: food.emoji,
      iconSrc: food.iconSrc,
      startX: touch.clientX,
      startY: touch.clientY,
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleStoredItemTouchStart = (event: ReactTouchEvent<HTMLDivElement>, item: StoredFoodItem) => {
    if (event.touches.length !== 1) return;

    const touch = event.changedTouches.item(0) || event.touches.item(0);

    if (!touch) return;

    startLongPressMobileDrag({
      type: 'stored',
      touchId: touch.identifier,
      item,
      label: item.customName || item.name,
      emoji: item.emoji,
      iconSrc: item.iconSrc,
      startX: touch.clientX,
      startY: touch.clientY,
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleDashboardDragOver = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes(STORED_ITEM_DRAG_TYPE)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDashboardDrop = (event: DragEvent<HTMLElement>) => {
    const itemId = event.dataTransfer.getData(STORED_ITEM_DRAG_TYPE);

    if (!itemId || getStorageSectionFromPoint(event.clientX, event.clientY)) return;

    event.preventDefault();
    setDragOverSection(null);

    const itemToDelete = [...freezerItems, ...fridgeItems].find((item) => item.uniqueId === itemId);

    if (itemToDelete) {
      handleDeleteItem(itemToDelete);
    }
  };

  useEffect(() => {
    const clearMobileDrag = () => {
      clearMobileDragTimer();
      pendingMobileDragRef.current = null;
      activeMobileDragRef.current = null;
      setMobileDragPreview(null);
      setDragOverSection(null);
    };

    const finishMobileDrag = (dragPreview: MobileDragPreview, x: number, y: number) => {
      const targetSection = getStorageSectionFromPoint(x, y);
      const actions = mobileDragActionsRef.current;

      if (!actions) return;

      if (dragPreview.type === 'food') {
        if (targetSection) {
          actions.dropFood(dragPreview.foodId, targetSection);
        }

        return;
      }

      if (targetSection) {
        actions.moveStoredItem(dragPreview.item.uniqueId, targetSection);
        return;
      }

      actions.deleteItem(dragPreview.item);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const pendingDrag = pendingMobileDragRef.current;

      if (!pendingDrag) return;

      const touch = getTouchById(event.touches, pendingDrag.touchId);

      if (!touch) return;

      const dragDistance = Math.hypot(touch.clientX - pendingDrag.startX, touch.clientY - pendingDrag.startY);
      const activeDrag = activeMobileDragRef.current;

      if (!activeDrag) {
        if (dragDistance > TOUCH_DRAG_THRESHOLD) {
          clearMobileDrag();
          return;
        }

        pendingMobileDragRef.current = {
          ...pendingDrag,
          x: touch.clientX,
          y: touch.clientY,
        };
        return;
      }

      event.preventDefault();

      const nextPreview = {
        ...activeDrag,
        x: touch.clientX,
        y: touch.clientY,
      };

      pendingMobileDragRef.current = nextPreview;
      activeMobileDragRef.current = nextPreview;
      setMobileDragPreview(nextPreview);
      setDragOverSection(getStorageSectionFromPoint(touch.clientX, touch.clientY));
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const pendingDrag = pendingMobileDragRef.current;

      if (!pendingDrag) return;

      const touch = getTouchById(event.changedTouches, pendingDrag.touchId);

      if (!touch) return;

      const activeDrag = activeMobileDragRef.current;

      if (activeDrag) {
        event.preventDefault();
        suppressSelectAfterDragRef.current = true;
        finishMobileDrag(activeDrag, touch.clientX, touch.clientY);
        window.setTimeout(() => {
          suppressSelectAfterDragRef.current = false;
        }, 100);
      }

      clearMobileDrag();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', clearMobileDrag);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', clearMobileDrag);
    };
  }, []);

  return (
    <div
      onDragOver={handleDashboardDragOver}
      onDrop={handleDashboardDrop}
      className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-sky-50 to-white p-1.5 sm:p-4 md:p-6 lg:p-8"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      <div className="mx-auto flex w-full max-w-[1320px] min-w-0 flex-col">
        <header className="mb-1.5 flex flex-shrink-0 items-center justify-between sm:mb-4 md:mb-5">
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

          <button
            type="button"
            onClick={() => setIsSettingsPanelOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sky-600 transition-colors hover:bg-sky-100"
            aria-label="설정 열기"
          >
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.73v.52a2 2 0 0 1-1 1.73l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.73v-.52a2 2 0 0 1 1-1.73l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </header>

        <main className="h-[calc(100dvh-58px)] min-h-0 rounded-2xl border-2 border-sky-700 bg-sky-600 p-1.5 shadow-xl sm:h-[calc(100vh-104px)] sm:min-h-[560px] sm:max-h-[680px] sm:p-4 md:p-5 lg:p-6">
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-1.5 sm:grid sm:grid-cols-[clamp(108px,13vw,180px)_minmax(0,1fr)] sm:gap-4 md:gap-5 lg:gap-6">
            <aside className="min-h-0 min-w-0 flex-shrink-0 sm:h-full">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white p-1.5 shadow-lg sm:h-full sm:p-3 md:p-4">
                <div className="mb-1.5 text-center text-sm font-bold text-sky-600 sm:mb-3 sm:text-base md:text-lg">식재료</div>

                <div
                  className="grid max-h-[92px] grid-cols-3 gap-2 overflow-y-auto pr-0.5 scrollbar-hide sm:max-h-none sm:flex-1 sm:grid-cols-1 sm:gap-3 sm:pr-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {foodCatalog.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      draggable
                      onDragStart={(event) => handleFoodDragStart(event, food)}
                      onDragEnd={() => setDragOverSection(null)}
                      onTouchStart={(event) => handleFoodTouchStart(event, food)}
                      className="relative flex min-h-[86px] touch-manipulation cursor-grab select-none flex-col items-center justify-center gap-1 rounded-xl border-2 border-sky-200 bg-white p-1.5 transition-all hover:border-sky-400 hover:shadow-md active:cursor-grabbing sm:min-h-[92px] sm:p-2 lg:min-h-[104px]"
                      aria-label={`${food.name} 드래그해서 추가`}
                    >
                      {food.rank && (
                        <span className="absolute left-1 top-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[8px] font-bold text-sky-600">
                          {food.rank}
                        </span>
                      )}
                      <FoodIcon
                        emoji={food.emoji}
                        iconSrc={food.iconSrc}
                        name={food.name}
                        emojiClassName="text-xl sm:text-2xl md:text-3xl"
                        imageClassName="h-8 w-8 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10"
                      />
                      <span className="max-w-full truncate whitespace-nowrap px-1 text-[9px] font-medium text-gray-700 sm:text-[10px] md:text-[11px]">{food.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomFoodModalOpen(true)}
                  className="mt-1.5 flex h-9 flex-shrink-0 items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-sky-50 text-xs font-bold text-sky-600 transition-all hover:border-sky-400 hover:bg-white hover:shadow-sm sm:mt-3 sm:h-10"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="whitespace-nowrap">식재료 추가</span>
                </button>
              </div>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-1.5 shadow-2xl sm:p-4 md:p-5 lg:p-6">
              <div className="flex h-full min-h-0 flex-col gap-1.5 sm:gap-4 md:gap-5">
                <div className="relative flex flex-shrink-0 items-center gap-1 rounded-xl border border-sky-200 bg-white/80 p-1 shadow-sm sm:gap-2 sm:p-1.5">
                  <div className="font-bold flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide sm:gap-1.5 " style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {EXPIRY_FILTER_OPTIONS.map((option) => {
                      const isActive = expiryFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChangeExpiryFilter(option.value)}
                          className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors sm:px-3 sm:text-xs ${
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
                    <button
                      type="button"
                      onClick={() => setIsSortMenuOpen((prevOpen) => !prevOpen)}
                      className="flex min-w-[70px] shrink-0 items-center justify-between gap-1 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 sm:min-w-[94px] sm:px-3 sm:text-xs"
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



                {(isIngredientStorageLoading || ingredientStorageMessage) && (
                  <div
                    className={`flex-shrink-0 rounded-xl border px-3 py-2 text-center text-[11px] font-bold sm:text-xs ${
                      ingredientStorageMessage
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-sky-200 bg-sky-50 text-sky-600'
                    }`}
                  >
                    {ingredientStorageMessage || '식재료 저장소를 불러오는 중입니다.'}
                  </div>
                )}

                <StorageZone
                  section="freezer"
                  title="냉동 칸"
                  items={filteredFreezerItems}
                  selectedItemId={selectedItem?.uniqueId}
                  emptyMessage={isIngredientStorageLoading ? '식재료 저장소를 불러오는 중입니다.' : emptyStorageMessage}
                  isDragOver={dragOverSection === 'freezer'}
                  onDragEnterSection={setDragOverSection}
                  onDragLeaveSection={() => setDragOverSection(null)}
                  onDropFood={handleDropFood}
                  onDropStoredItem={handleMoveStoredItem}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                  onStartMobileDragItem={handleStoredItemTouchStart}
                  onOpenList={setActiveListSection}
                />
                <StorageZone
                  section="fridge"
                  title="냉장 칸"
                  items={filteredFridgeItems}
                  selectedItemId={selectedItem?.uniqueId}
                  emptyMessage={isIngredientStorageLoading ? '식재료 저장소를 불러오는 중입니다.' : emptyStorageMessage}
                  isDragOver={dragOverSection === 'fridge'}
                  onDragEnterSection={setDragOverSection}
                  onDragLeaveSection={() => setDragOverSection(null)}
                  onDropFood={handleDropFood}
                  onDropStoredItem={handleMoveStoredItem}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                  onStartMobileDragItem={handleStoredItemTouchStart}
                  onOpenList={setActiveListSection}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {mobileDragPreview && (
        <div
          className={`pointer-events-none fixed z-[80] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl border-2 bg-white/95 px-3 py-2 text-xs font-bold shadow-2xl backdrop-blur-sm ${
            dragOverSection
              ? 'border-emerald-300 text-emerald-700'
              : mobileDragPreview.type === 'stored'
                ? 'border-red-300 text-red-600'
                : 'border-sky-300 text-sky-600'
          }`}
          style={{ left: mobileDragPreview.x, top: mobileDragPreview.y }}
        >
          <FoodIcon
            emoji={mobileDragPreview.emoji}
            iconSrc={mobileDragPreview.iconSrc}
            name={mobileDragPreview.label}
            emojiClassName="text-xl"
            imageClassName="h-8 w-8 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="max-w-[96px] truncate">{mobileDragPreview.label}</span>
            <span className="text-[10px]">
              {dragOverSection ? '여기에 놓기' : mobileDragPreview.type === 'stored' ? '놓으면 삭제' : '칸 위에 놓기'}
            </span>
          </div>
        </div>
      )}

      <OptionMenuPanel
        isOpen={isOptionMenuOpen}
        activeItemId={activeOptionMenu}
        onSelectItem={handleSelectOptionMenu}
        onClose={() => setIsOptionMenuOpen(false)}
      />

      <RecipeListPanel
        isOpen={isRecipePanelOpen}
        ingredients={recipeIngredients}
        onClose={() => setIsRecipePanelOpen(false)}
      />

      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        onLogout={onLogout}
      />

      {activeListSection && (
        <StorageListPanel
          section={activeListSection}
          title={activeListTitle}
          items={activeListItems}
          onSelectItem={(item) => {
            handleSelectItem(item);
            setActiveListSection(null);
          }}
          onDeleteItems={handleDeleteItems}
          onClose={() => setActiveListSection(null)}
        />
      )}
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
