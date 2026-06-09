import { useEffect, useMemo, useState } from 'react';

import { fetchRecipeRecommendations, mergeRecipeRecommendationList, RECIPE_PAGE_SIZE } from '../../api/recipeApi';
import type { RecipeIngredientInput, RecipeRecommendation } from '../../types/recipe';

interface RecipeListPanelProps {
  isOpen: boolean;
  ingredients: RecipeIngredientInput[];
  onClose: () => void;
}

const TEXT = {
  noInfo: '\uC815\uBCF4 \uC5C6\uC74C',
  title: '\uB808\uC2DC\uD53C \uCD94\uCC9C',
  detail: '\uB808\uC2DC\uD53C \uC0C1\uC138',
  matchedOrder: '\uBCF4\uC720 \uC7AC\uB8CC\uAC00 \uB9CE\uC740 \uC21C\uC11C',
  close: '\uB808\uC2DC\uD53C \uCD94\uCC9C \uB2EB\uAE30',
  backToList: '\uBAA9\uB85D\uC73C\uB85C',
  noImage: '\uC774\uBBF8\uC9C0 \uC5C6\uC74C',
  ingredientInfo: '\uC7AC\uB8CC \uC815\uBCF4',
  cookingMethod: '\uC870\uB9AC\uBC29\uBC95',
  loading: '\uC2DD\uC57D\uCC98 \uB808\uC2DC\uD53C DB\uC5D0\uC11C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.',
  noList: '\uB9AC\uC2A4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
  retryGuide: '\uB2E4\uB978 \uC2DD\uC7AC\uB8CC\uB97C \uB123\uAC70\uB098 \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
  emptyGuide: '\uC2DD\uC7AC\uB8CC\uB97C \uB0C9\uC7A5\uCE78\uC774\uB098 \uB0C9\uB3D9\uCE78\uC5D0 \uB123\uC73C\uBA74, \uAC01 \uC7AC\uB8CC\uBCC4 \uB808\uC2DC\uD53C \uB9AC\uC2A4\uD2B8\uB97C \uBD88\uB7EC\uC635\uB2C8\uB2E4.',
  basedOn: '\uAE30\uC900',
  readyToCook: '\uBC14\uB85C \uAC00\uB2A5',
  missing: '\uBD80\uC871',
  countSuffix: '\uAC1C',
  missingIngredients: '\uBD80\uC871\uD55C \uC7AC\uB8CC',
  none: '\uC5C6\uC74C',
  previous: '\uC774\uC804',
  next: '\uB2E4\uC74C',
  pageSuffix: '\uD398\uC774\uC9C0',
  loadingMore: '\uBD88\uB7EC\uC624\uB294 \uC911',
};

function getCalorieText(calories: string) {
  return calories === TEXT.noInfo ? calories : `${calories}kcal`;
}

function getPageItems(recipes: RecipeRecommendation[], page: number) {
  const startIndex = (page - 1) * RECIPE_PAGE_SIZE;

  return recipes.slice(startIndex, startIndex + RECIPE_PAGE_SIZE);
}

function getUiPageCount(recipes: RecipeRecommendation[]) {
  return Math.max(1, Math.ceil(recipes.length / RECIPE_PAGE_SIZE));
}

// Modal panel shown when the recipe recommendation option is selected.
export function RecipeListPanel({ isOpen, ingredients, onClose }: RecipeListPanelProps) {
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedApiPage, setLoadedApiPage] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visibleRecipes = useMemo(() => getPageItems(recipes, currentPage), [recipes, currentPage]);
  const loadedUiPageCount = getUiPageCount(recipes);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < loadedUiPageCount || loadedApiPage < totalApiPages;

  useEffect(() => {
    if (!isOpen) return;

    let isCanceled = false;
    setIsLoading(true);
    setIsPageLoading(false);
    setErrorMessage('');
    setSelectedRecipe(null);
    setCurrentPage(1);
    setLoadedApiPage(0);
    setTotalApiPages(1);

    fetchRecipeRecommendations(ingredients, 1, RECIPE_PAGE_SIZE)
      .then((result) => {
        if (isCanceled) return;

        setRecipes(result.recipes);
        setLoadedApiPage(result.page);
        setTotalApiPages(result.totalApiPages);
      })
      .catch(() => {
        if (isCanceled) return;

        setRecipes([]);
        setErrorMessage(TEXT.noList);
      })
      .finally(() => {
        if (isCanceled) return;

        setIsLoading(false);
      });

    return () => {
      isCanceled = true;
    };
  }, [isOpen, ingredients]);

  const handleGoPreviousPage = () => {
    setSelectedRecipe(null);
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
  };

  const handleGoNextPage = async () => {
    if (!canGoNext || isPageLoading) return;

    const targetPage = currentPage + 1;

    if (targetPage <= loadedUiPageCount) {
      setSelectedRecipe(null);
      setCurrentPage(targetPage);
      return;
    }

    setIsPageLoading(true);
    setErrorMessage('');

    let nextRecipes = recipes;
    let nextLoadedApiPage = loadedApiPage;
    let nextTotalApiPages = totalApiPages;

    try {
      while (targetPage > getUiPageCount(nextRecipes) && nextLoadedApiPage < nextTotalApiPages) {
        const result = await fetchRecipeRecommendations(ingredients, nextLoadedApiPage + 1, RECIPE_PAGE_SIZE);

        nextLoadedApiPage = result.page;
        nextTotalApiPages = result.totalApiPages;
        nextRecipes = mergeRecipeRecommendationList([...nextRecipes, ...result.recipes]);

        if (!result.hasMore && result.recipes.length === 0) break;
      }

      setRecipes(nextRecipes);
      setLoadedApiPage(nextLoadedApiPage);
      setTotalApiPages(nextTotalApiPages);

      if (targetPage <= getUiPageCount(nextRecipes)) {
        setSelectedRecipe(null);
        setCurrentPage(targetPage);
      }
    } catch {
      setErrorMessage(TEXT.noList);
    } finally {
      setIsPageLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3" onClick={onClose}>
      <section
        className="flex max-h-[min(720px,92vh)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-sky-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-sky-700">{TEXT.title}</h2>
            <p className="mt-0.5 truncate text-xs font-bold text-gray-400">
              {selectedRecipe ? TEXT.detail : TEXT.matchedOrder}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-lg font-bold text-sky-600 transition-colors hover:bg-sky-100"
            aria-label={TEXT.close}
          >
            x
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {selectedRecipe ? (
            <div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600 transition-colors hover:bg-white"
              >
                {TEXT.backToList}
              </button>

              <div className="overflow-hidden rounded-xl border-2 border-sky-100 bg-white shadow-sm">
                {selectedRecipe.imageUrl ? (
                  <img
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.title}
                    className="h-52 w-full object-cover sm:h-64"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-sky-50 text-sm font-bold text-sky-300">
                    {TEXT.noImage}
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{selectedRecipe.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-600">{selectedRecipe.method}</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        {getCalorieText(selectedRecipe.calories)}
                      </span>
                    </div>
                  </div>

                  <section className="mb-4 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                    <h4 className="mb-2 text-sm font-bold text-sky-700">{TEXT.ingredientInfo}</h4>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-gray-600">{selectedRecipe.ingredientText}</p>
                  </section>

                  <section className="rounded-xl border border-sky-100 bg-white p-3">
                    <h4 className="mb-2 text-sm font-bold text-sky-700">{TEXT.cookingMethod}</h4>
                    <ol className="space-y-2">
                      {selectedRecipe.manualSteps.map((step) => (
                        <li key={step} className="rounded-lg bg-gray-50 p-2 text-xs leading-relaxed text-gray-600">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-sky-100 bg-sky-50 text-sm font-bold text-sky-500">
              {TEXT.loading}
            </div>
          ) : errorMessage ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-100 bg-sky-50 px-4 text-center">
              <p className="text-sm font-bold text-sky-600">{errorMessage}</p>
              <p className="mt-2 text-xs font-bold leading-relaxed text-gray-400">
                {TEXT.retryGuide}
              </p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-100 bg-sky-50 px-4 text-center">
              <p className="text-sm font-bold text-sky-600">{TEXT.noList}</p>
              <p className="mt-2 text-xs font-bold leading-relaxed text-gray-400">
                {TEXT.emptyGuide}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {visibleRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="rounded-xl border-2 border-sky-100 bg-white p-3 text-left shadow-sm transition-all hover:border-sky-300 hover:shadow-md"
                >
                  <div className="grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)]">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="h-28 w-full rounded-lg object-cover sm:h-full"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-sky-300">
                        {TEXT.noImage}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-gray-800">{recipe.title}</h3>
                          <p className="mt-1 truncate text-xs font-bold text-gray-400">
                            {recipe.sourceIngredients.join(', ')} {TEXT.basedOn}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                            {getCalorieText(recipe.calories)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              recipe.missingIngredients.length === 0
                                ? 'bg-sky-50 text-sky-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {recipe.missingIngredients.length === 0
                              ? TEXT.readyToCook
                              : `${TEXT.missing} ${recipe.missingIngredients.length}${TEXT.countSuffix}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {recipe.ingredientKeywords.slice(0, 8).map((ingredient) => {
                          const isMatched = recipe.matchedIngredients.includes(ingredient);

                          return (
                            <span
                              key={ingredient}
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                isMatched
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                  : 'border-gray-200 bg-gray-50 text-gray-400'
                              }`}
                            >
                              {ingredient}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-3 border-t border-sky-50 pt-3">
                        <p className="mb-1 text-[10px] font-bold text-gray-400">{TEXT.missingIngredients}</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.missingIngredients.length === 0 ? (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600">{TEXT.none}</span>
                          ) : (
                            recipe.missingIngredients.slice(0, 6).map((ingredient) => (
                              <span key={ingredient} className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                {ingredient}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2">
                <button
                  type="button"
                  onClick={handleGoPreviousPage}
                  disabled={!canGoPrevious || isPageLoading}
                  className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {TEXT.previous}
                </button>
                <span className="text-xs font-bold text-gray-500">
                  {currentPage}{TEXT.pageSuffix}
                </span>
                <button
                  type="button"
                  onClick={() => void handleGoNextPage()}
                  disabled={!canGoNext || isPageLoading}
                  className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPageLoading ? TEXT.loadingMore : TEXT.next}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}