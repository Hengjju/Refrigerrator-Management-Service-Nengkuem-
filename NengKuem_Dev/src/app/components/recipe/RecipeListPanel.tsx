interface RecipeListPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecipePreview {
  id: string;
  title: string;
  icon: string;
  time: string;
  description: string;
  ingredients: string[];
  tags: string[];
}

const RECIPE_PREVIEWS: RecipePreview[] = [
  {
    id: 'egg-cheese-toast',
    title: '계란 치즈 토스트',
    icon: '🍳',
    time: '10분',
    description: '계란과 치즈를 빠르게 활용하기 좋은 간단 메뉴입니다.',
    ingredients: ['달걀', '치즈', '우유'],
    tags: ['아침', '간단'],
  },
  {
    id: 'milk-cream-pasta',
    title: '우유 크림 파스타',
    icon: '🥛',
    time: '20분',
    description: '우유와 남은 재료를 부드럽게 묶어 먹는 추천 메뉴입니다.',
    ingredients: ['우유', '치즈'],
    tags: ['든든', '따뜻함'],
  },
  {
    id: 'vegetable-fried-rice',
    title: '냉장고 볶음밥',
    icon: '🍚',
    time: '15분',
    description: '자투리 식재료를 한 번에 정리하기 좋은 기본 레시피입니다.',
    ingredients: ['달걀', '사과', '치즈'],
    tags: ['정리', '한끼'],
  },
];

// 옵션 메뉴의 레시피 추천을 눌렀을 때 열리는 레시피 리스트 창입니다.
export function RecipeListPanel({ isOpen, onClose }: RecipeListPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3" onClick={onClose}>
      <section
        className="flex max-h-[min(640px,92vh)] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-sky-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-sky-700">레시피 추천</h2>
            <p className="mt-0.5 truncate text-xs font-bold text-gray-400">레시피 리스트</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-lg font-bold text-sky-600 transition-colors hover:bg-sky-100"
            aria-label="레시피 추천 닫기"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {RECIPE_PREVIEWS.map((recipe) => (
              <article key={recipe.id} className="rounded-xl border-2 border-sky-100 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-2xl" aria-hidden="true">{recipe.icon}</span>
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-600">{recipe.time}</span>
                </div>
                <h3 className="truncate text-sm font-bold text-gray-800">{recipe.title}</h3>
                <p className="mt-1 min-h-[34px] text-xs leading-relaxed text-gray-500">{recipe.description}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.ingredients.map((ingredient) => (
                    <span key={ingredient} className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                      {ingredient}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1 border-t border-sky-50 pt-3">
                  {recipe.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}