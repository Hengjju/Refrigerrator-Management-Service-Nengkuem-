import { useState } from 'react';

import { AVAILABLE_FOODS } from '../constants/foodCategories';
import { StorageZone } from '../components/fridge/StorageZone';
import type { FoodItem } from '../types/food';
import type { StoredFoodItem } from '../types/ingredient';

// 4단계 메인 화면입니다.
// 왼쪽 식재료를 클릭하면 냉장 칸에 추가되는 가장 기본적인 기능을 연결합니다.
export function DashboardPage() {
  const freezerItems: StoredFoodItem[] = [];
  const [fridgeItems, setFridgeItems] = useState<StoredFoodItem[]>([]);

  const handleAddToFridge = (food: FoodItem) => {
    const newItem: StoredFoodItem = {
      ...food,
      uniqueId: `${food.id}-${Date.now()}`,
      section: 'fridge',
    };

    setFridgeItems((prevItems) => [...prevItems, newItem]);
  };

  return (
    <div
      className="size-full bg-gradient-to-br from-sky-50 to-white p-4 md:p-8 overflow-hidden flex flex-col"
      style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-1.5">
            <span className="block w-5 h-0.5 rounded-full bg-sky-600" />
            <span className="block w-5 h-0.5 rounded-full bg-sky-600" />
            <span className="block w-5 h-0.5 rounded-full bg-sky-600" />
          </div>

          <h1 className="text-2xl font-bold text-sky-600" style={{ fontFamily: "'YeogiOttaeJalnan', cursive" }}>
            냉큼
          </h1>

          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="block w-5 h-5 rounded-full border-2 border-sky-600" />
          </div>
        </header>

        <main className="flex-1 min-h-0 bg-sky-600 rounded-2xl shadow-xl border-2 border-sky-700 p-4 md:p-6">
          <div className="flex gap-4 h-full">
            <aside className="w-[100px] md:w-[112px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-2 border-2 border-sky-200 h-full flex flex-col">
                <div className="mb-2 text-center text-xs font-bold text-sky-600">식재료</div>
                <div
                  className="grid grid-cols-1 gap-1.5 overflow-y-auto flex-1 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {AVAILABLE_FOODS.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleAddToFridge(food)}
                      className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg bg-white border-2 border-sky-200 hover:border-sky-400 hover:shadow-md transition-all"
                    >
                      <span className="text-xl">{food.emoji}</span>
                      <span className="text-[9px] font-medium text-gray-700">{food.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="flex-1 min-h-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-xl shadow-2xl p-4 md:p-6 border-2 border-gray-300 h-full flex flex-col gap-3 md:gap-4">
              <StorageZone section="freezer" title="냉동 칸" items={freezerItems} />
              <StorageZone section="fridge" title="냉장 칸" items={fridgeItems} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
