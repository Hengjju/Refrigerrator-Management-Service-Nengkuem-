import type { StoredFoodItem, StorageSection } from '../../types/ingredient';

interface StorageZoneProps {
  section: StorageSection;
  title: string;
  items: StoredFoodItem[];
}

// 냉동 칸과 냉장 칸을 공통으로 표현하는 보관 칸 컴포넌트입니다.
// 아직 추가/이동 기능은 없고, 전달받은 식재료 목록을 화면에 표시하는 역할만 합니다.
export function StorageZone({ title, items }: StorageZoneProps) {
  const hasItems = items.length > 0;

  return (
    <div className="flex-1 rounded-lg border-2 border-sky-300 bg-sky-50 p-4 flex flex-col">
      <h2 className="font-bold text-center text-sky-600 mb-3">{title}</h2>
      <div className="flex-1 rounded-lg border-2 border-dashed border-sky-200 bg-white/70 p-3">
        {hasItems ? (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.uniqueId}
                className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg bg-white border-2 border-sky-200"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[9px] font-medium text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm font-medium text-sky-500">아직 등록된 식재료가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
