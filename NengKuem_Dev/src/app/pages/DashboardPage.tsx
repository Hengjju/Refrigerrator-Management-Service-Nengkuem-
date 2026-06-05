import { AVAILABLE_FOODS } from '../constants/foodCategories';

// 2단계 메인 화면입니다.
// 기능은 아직 없고, 정적 냉장고 UI에 식재료 카탈로그 목록만 추가합니다.
export function DashboardPage() {
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
                    <div
                      key={food.id}
                      className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg bg-white border-2 border-sky-200"
                    >
                      <span className="text-xl">{food.emoji}</span>
                      <span className="text-[9px] font-medium text-gray-700">{food.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="flex-1 min-h-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-xl shadow-2xl p-4 md:p-6 border-2 border-gray-300 h-full flex flex-col gap-3 md:gap-4">
              <div className="flex-1 rounded-lg border-2 border-sky-300 bg-sky-50 p-4 flex flex-col">
                <h2 className="font-bold text-center text-sky-600 mb-3">냉동 칸</h2>
                <div className="flex-1 rounded-lg border-2 border-dashed border-sky-200 bg-white/70 flex items-center justify-center">
                  <p className="text-sm font-medium text-sky-500">아직 등록된 식재료가 없습니다.</p>
                </div>
              </div>

              <div className="flex-1 rounded-lg border-2 border-sky-300 bg-sky-50 p-4 flex flex-col">
                <h2 className="font-bold text-center text-sky-600 mb-3">냉장 칸</h2>
                <div className="flex-1 rounded-lg border-2 border-dashed border-sky-200 bg-white/70 flex items-center justify-center">
                  <p className="text-sm font-medium text-sky-500">아직 등록된 식재료가 없습니다.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
