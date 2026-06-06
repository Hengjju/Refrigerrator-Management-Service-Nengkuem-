import type { StoredFoodItem, StorageSection } from '../../types/ingredient';

interface StorageZoneProps {
  section: StorageSection;
  title: string;
  items: StoredFoodItem[];
  onDeleteItem: (item: StoredFoodItem) => void;
}

// 냉동 칸과 냉장 칸을 공통으로 표현하는 보관 칸 컴포넌트입니다.
// 6단계에서는 전달받은 식재료 목록을 보여주고, 각 항목을 삭제할 수 있게 합니다.
export function StorageZone({ title, items, onDeleteItem }: StorageZoneProps) {
  const hasItems = items.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border-2 border-sky-300 bg-sky-50 p-3 sm:p-4 md:p-5">
      <h2 className="mb-3 flex-shrink-0 text-center text-xl font-bold text-sky-600 sm:text-2xl md:mb-4 md:text-3xl">{title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-dashed border-sky-200 bg-white/70 p-3 sm:p-4">
        {hasItems ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.uniqueId}
                className="relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-sky-200 bg-white p-2 sm:min-h-[86px]"
              >
                <button
                  type="button"
                  onClick={() => onDeleteItem(item)}
                  className="absolute right-1 top-1 h-5 w-5 rounded-full border border-red-300 bg-white text-[10px] font-bold text-red-500 transition-colors hover:bg-red-50"
                  aria-label={`${item.name} 삭제`}
                >
                  ×
                </button>
                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                <span className="text-[10px] font-medium text-gray-700 sm:text-[11px]">{item.name}</span>
              </div>
            ))}
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
