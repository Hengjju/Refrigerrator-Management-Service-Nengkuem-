import { useState } from 'react';

import { AVAILABLE_FOODS } from '../constants/foodCategories';
import { ItemEditPanel } from '../components/fridge/ItemEditPanel';
import { StorageZone } from '../components/fridge/StorageZone';
import type { FoodItem } from '../types/food';
import type { StoredFoodItem, StorageSection } from '../types/ingredient';

// 8단계 메인 화면입니다.
// 식재료 추가/삭제/이름 수정에 더해, 상세 패널에서 유통기한을 입력할 수 있습니다.
export function DashboardPage() {
  const [selectedSection, setSelectedSection] = useState<StorageSection>('fridge');
  const [freezerItems, setFreezerItems] = useState<StoredFoodItem[]>([]);
  const [fridgeItems, setFridgeItems] = useState<StoredFoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoredFoodItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingExpiryDate, setEditingExpiryDate] = useState('');

  const handleAddItem = (food: FoodItem) => {
    const newItem: StoredFoodItem = {
      ...food,
      uniqueId: `${selectedSection}-${food.id}-${Date.now()}`,
      section: selectedSection,
    };

    if (selectedSection === 'freezer') {
      setFreezerItems((prevItems) => [...prevItems, newItem]);
      return;
    }

    setFridgeItems((prevItems) => [...prevItems, newItem]);
  };

  const handleSelectItem = (item: StoredFoodItem) => {
    setSelectedItem(item);
    setEditingName(item.customName || item.name);
    setEditingExpiryDate(item.expiryDate || '');
  };

  const handleCloseEditPanel = () => {
    setSelectedItem(null);
    setEditingName('');
    setEditingExpiryDate('');
  };

  const handleSaveItemDetail = () => {
    if (!selectedItem) return;

    const nextName = editingName.trim() || selectedItem.name;
    const nextExpiryDate = editingExpiryDate || undefined;
    const updateItems = (items: StoredFoodItem[]) =>
      items.map((item) =>
        item.uniqueId === selectedItem.uniqueId
          ? { ...item, customName: nextName, expiryDate: nextExpiryDate }
          : item,
      );

    if (selectedItem.section === 'freezer') {
      setFreezerItems(updateItems);
    } else {
      setFridgeItems(updateItems);
    }

    handleCloseEditPanel();
  };

  const handleDeleteItem = (itemToDelete: StoredFoodItem) => {
    if (selectedItem?.uniqueId === itemToDelete.uniqueId) {
      handleCloseEditPanel();
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
          <div className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg">
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
            <span className="block h-0.5 w-5 rounded-full bg-sky-600" />
          </div>

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
                <div className="mb-2 text-center text-sm font-bold text-sky-600 sm:text-base md:mb-3 md:text-lg">식재료</div>

                <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl border border-sky-200 bg-sky-50 p-1 md:mb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSection('fridge')}
                    className={`rounded-lg px-1 py-1.5 text-[10px] font-bold transition-colors sm:text-xs ${
                      selectedSection === 'fridge'
                        ? 'bg-white text-sky-700 shadow-sm'
                        : 'text-sky-500 hover:text-sky-700'
                    }`}
                  >
                    냉장
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSection('freezer')}
                    className={`rounded-lg px-1 py-1.5 text-[10px] font-bold transition-colors sm:text-xs ${
                      selectedSection === 'freezer'
                        ? 'bg-white text-sky-700 shadow-sm'
                        : 'text-sky-500 hover:text-sky-700'
                    }`}
                  >
                    냉동
                  </button>
                </div>

                <div
                  className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto pr-0.5 scrollbar-hide sm:gap-3 sm:pr-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {AVAILABLE_FOODS.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleAddItem(food)}
                      className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-sky-200 bg-white p-1.5 transition-all hover:border-sky-400 hover:shadow-md sm:min-h-[92px] md:min-h-[104px] md:p-2"
                    >
                      <span className="text-xl sm:text-2xl md:text-3xl">{food.emoji}</span>
                      <span className="text-[10px] font-medium text-gray-700 sm:text-xs">{food.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="min-h-0 min-w-0 overflow-hidden rounded-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-3 shadow-2xl sm:p-4 md:p-5 lg:p-6">
              <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4 md:gap-5">
                <StorageZone
                  section="freezer"
                  title="냉동 칸"
                  items={freezerItems}
                  selectedItemId={selectedItem?.uniqueId}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                />
                <StorageZone
                  section="fridge"
                  title="냉장 칸"
                  items={fridgeItems}
                  selectedItemId={selectedItem?.uniqueId}
                  onSelectItem={handleSelectItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {selectedItem && (
        <ItemEditPanel
          item={selectedItem}
          nameValue={editingName}
          expiryDateValue={editingExpiryDate}
          onNameChange={setEditingName}
          onExpiryDateChange={setEditingExpiryDate}
          onSave={handleSaveItemDetail}
          onClose={handleCloseEditPanel}
        />
      )}
    </div>
  );
}
