import axios from 'axios';

import type { RecipeIngredientInput, RecipeRecommendation, RecipeRecommendationPageResult } from '../types/recipe';

const FOOD_SAFETY_API_KEY = import.meta.env.VITE_FOODSAFETY_API_KEY?.trim();
const FOOD_SAFETY_API_BASE_URL = 'https://openapi.foodsafetykorea.go.kr/api';
const MAX_SEARCH_INGREDIENTS = 8;
const MANUAL_STEP_COUNT = 20;
const REQUEST_TIMEOUT_MS = 8000;
const NO_INFO_TEXT = '\uC815\uBCF4 \uC5C6\uC74C';

export const RECIPE_PAGE_SIZE = 12;

const HANGUL_WORD_PATTERN = /[\uAC00-\uD7A3]{2,}/g;
const INGREDIENT_STOP_WORDS = new Set([
  '\uC7AC\uB8CC',
  '\uC8FC\uC7AC\uB8CC',
  '\uBD80\uC7AC\uB8CC',
  '\uC591\uB150',
  '\uC18C\uC2A4',
  '\uC0D0\uB7EC\uB4DC',
  '\uC57D\uAC04',
  '\uC18C\uAE08',
  '\uC124\uD0D5',
  '\uD6C4\uCD94',
  '\uC2DD\uC6A9\uC720',
  '\uCC38\uAE30\uB984',
  '\uAC04\uC7A5',
]);

const SEARCH_ALIASES: Record<string, string[]> = {
  '\uB2EC\uAC40': ['\uACC4\uB780'],
  '\uACC4\uB780': ['\uB2EC\uAC40'],
};

export class RecipeApiKeyError extends Error {
  constructor(message = 'Recipe API key is missing or invalid.') {
    super(message);
    this.name = 'RecipeApiKeyError';
  }
}

type FoodSafetyRecipeRow = Record<string, string | undefined> & {
  RCP_SEQ?: string;
  RCP_NM?: string;
  RCP_WAY2?: string;
  INFO_ENG?: string;
  ATT_FILE_NO_MAIN?: string;
  ATT_FILE_NO_MK?: string;
  RCP_PARTS_DTLS?: string;
};

interface FoodSafetyRecipeResponse {
  COOKRCP01?: {
    total_count?: string | number;
    row?: FoodSafetyRecipeRow | FoodSafetyRecipeRow[];
    RESULT?: {
      CODE?: string;
      MSG?: string;
    };
  };
}

interface FoodSafetySearchResult {
  rows: FoodSafetyRecipeRow[];
  totalCount: number;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getEmptyRecipePage(page: number, pageSize: number): RecipeRecommendationPageResult {
  return {
    recipes: [],
    page,
    pageSize,
    totalApiPages: 1,
    hasMore: false,
  };
}

function getSafePage(value: number) {
  return Math.max(1, Math.floor(value) || 1);
}

function getSafePageSize(value: number) {
  return Math.max(1, Math.floor(value) || RECIPE_PAGE_SIZE);
}

function getSearchRange(page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = page * pageSize;

  return `${startIndex}/${endIndex}`;
}

function getTotalCount(data: FoodSafetyRecipeResponse) {
  const totalCount = Number(data.COOKRCP01?.total_count || 0);

  return Number.isFinite(totalCount) ? totalCount : 0;
}

function isFoodSafetyRecipeResponse(data: unknown): data is FoodSafetyRecipeResponse {
  return typeof data === 'object' && data !== null && 'COOKRCP01' in data;
}

function getRecipeRows(row: FoodSafetyRecipeRow | FoodSafetyRecipeRow[] | undefined) {
  if (!row) return [];

  return Array.isArray(row) ? row : [row];
}

function getManualSteps(row: FoodSafetyRecipeRow) {
  return Array.from({ length: MANUAL_STEP_COUNT }, (_, index) => {
    const stepNumber = String(index + 1).padStart(2, '0');
    return row[`MANUAL${stepNumber}`]?.trim() || '';
  }).filter(Boolean);
}

function getRecipeImageUrl(row: FoodSafetyRecipeRow) {
  return row.ATT_FILE_NO_MAIN?.trim() || row.ATT_FILE_NO_MK?.trim() || '';
}

function simplifyIngredientKeyword(value: string) {
  return value
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[0-9]+(?:[.,][0-9]+)?\s*(?:g|kg|ml|l|개|마리|큰술|작은술|컵|쪽|cm|분|모|줄기)?/gi, ' ')
    .replace(/[^\uAC00-\uD7A3\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractIngredientKeywords(ingredientText: string) {
  const keywords = ingredientText
    .split(/[\n,;:/]+/)
    .flatMap((value) => simplifyIngredientKeyword(value).match(HANGUL_WORD_PATTERN) || [])
    .map((value) => value.trim())
    .filter((value) => value.length >= 2 && !INGREDIENT_STOP_WORDS.has(value));

  return uniqueValues(keywords).slice(0, 10);
}

function isIngredientMatched(keyword: string, ingredientNames: string[]) {
  const normalizedKeyword = normalizeText(keyword);

  return ingredientNames.some((ingredientName) => {
    const normalizedIngredient = normalizeText(ingredientName);

    return normalizedKeyword.includes(normalizedIngredient) || normalizedIngredient.includes(normalizedKeyword);
  });
}

function getSearchTerms(ingredientName: string) {
  return uniqueValues([ingredientName, ...(SEARCH_ALIASES[ingredientName] || [])]);
}

function getMatchedIngredients(
  ingredientKeywords: string[],
  currentIngredientNames: string[],
  sourceIngredientName: string,
  ingredientText: string,
) {
  const matchedIngredients = ingredientKeywords.filter((keyword) => isIngredientMatched(keyword, currentIngredientNames));
  const normalizedIngredientText = normalizeText(ingredientText);
  const normalizedSourceIngredient = normalizeText(sourceIngredientName);

  if (
    normalizedSourceIngredient &&
    normalizedIngredientText.includes(normalizedSourceIngredient) &&
    !matchedIngredients.some((ingredient) => normalizeText(ingredient) === normalizedSourceIngredient)
  ) {
    matchedIngredients.unshift(sourceIngredientName);
  }

  return uniqueValues(matchedIngredients);
}

function getMissingIngredients(ingredientKeywords: string[], matchedIngredients: string[]) {
  return ingredientKeywords.filter((keyword) => !isIngredientMatched(keyword, matchedIngredients));
}

function mapRecipeRow(
  row: FoodSafetyRecipeRow,
  currentIngredientNames: string[],
  sourceIngredientName: string,
): RecipeRecommendation | null {
  const id = row.RCP_SEQ?.trim();
  const title = row.RCP_NM?.trim();
  const ingredientText = row.RCP_PARTS_DTLS?.trim() || '';

  if (!id || !title || !ingredientText) return null;

  const normalizedIngredientText = normalizeText(ingredientText);
  const normalizedSourceIngredient = normalizeText(sourceIngredientName);
  const parsedKeywords = extractIngredientKeywords(ingredientText);
  const ingredientKeywords = normalizedIngredientText.includes(normalizedSourceIngredient)
    ? uniqueValues([sourceIngredientName, ...parsedKeywords]).slice(0, 10)
    : parsedKeywords;
  const matchedIngredients = getMatchedIngredients(ingredientKeywords, currentIngredientNames, sourceIngredientName, ingredientText);
  const missingIngredients = getMissingIngredients(ingredientKeywords, matchedIngredients);

  if (matchedIngredients.length === 0) return null;

  return {
    id,
    title,
    method: row.RCP_WAY2?.trim() || NO_INFO_TEXT,
    calories: row.INFO_ENG?.trim() || NO_INFO_TEXT,
    imageUrl: getRecipeImageUrl(row),
    ingredientText,
    ingredientKeywords,
    sourceIngredients: [sourceIngredientName],
    matchedIngredients,
    missingIngredients,
    manualSteps: getManualSteps(row),
  };
}

function mergeRecipeRecommendation(
  previousRecipe: RecipeRecommendation,
  nextRecipe: RecipeRecommendation,
): RecipeRecommendation {
  const sourceIngredients = uniqueValues([...previousRecipe.sourceIngredients, ...nextRecipe.sourceIngredients]);
  const matchedIngredients = uniqueValues([...previousRecipe.matchedIngredients, ...nextRecipe.matchedIngredients]);
  const missingIngredients = getMissingIngredients(previousRecipe.ingredientKeywords, matchedIngredients);

  return {
    ...previousRecipe,
    sourceIngredients,
    matchedIngredients,
    missingIngredients,
  };
}

function compareRecipeRecommendations(firstRecipe: RecipeRecommendation, secondRecipe: RecipeRecommendation) {
  const matchDiff = secondRecipe.matchedIngredients.length - firstRecipe.matchedIngredients.length;

  if (matchDiff !== 0) return matchDiff;

  const missingDiff = firstRecipe.missingIngredients.length - secondRecipe.missingIngredients.length;

  if (missingDiff !== 0) return missingDiff;

  const requiredDiff = firstRecipe.ingredientKeywords.length - secondRecipe.ingredientKeywords.length;

  if (requiredDiff !== 0) return requiredDiff;

  const sourceDiff = secondRecipe.sourceIngredients.length - firstRecipe.sourceIngredients.length;

  if (sourceDiff !== 0) return sourceDiff;

  return firstRecipe.title.localeCompare(secondRecipe.title, 'ko');
}

export function mergeRecipeRecommendationList(recipes: RecipeRecommendation[]) {
  const recipesById = new Map<string, RecipeRecommendation>();

  recipes.forEach((recipe) => {
    const previousRecipe = recipesById.get(recipe.id);
    recipesById.set(recipe.id, previousRecipe ? mergeRecipeRecommendation(previousRecipe, recipe) : recipe);
  });

  return [...recipesById.values()].sort(compareRecipeRecommendations);
}

async function fetchRecipesBySearchTerm(
  apiKey: string,
  searchTerm: string,
  page: number,
  pageSize: number,
): Promise<FoodSafetySearchResult> {
  const encodedIngredient = encodeURIComponent(searchTerm);
  const requestUrl = `${FOOD_SAFETY_API_BASE_URL}/${apiKey}/COOKRCP01/json/${getSearchRange(page, pageSize)}/RCP_PARTS_DTLS=${encodedIngredient}`;
  const { data } = await axios.get<FoodSafetyRecipeResponse | string>(requestUrl, {
    timeout: REQUEST_TIMEOUT_MS,
  });

  if (typeof data === 'string') {
    if (data.toLowerCase().includes('api key')) {
      throw new RecipeApiKeyError();
    }

    return { rows: [], totalCount: 0 };
  }

  if (!isFoodSafetyRecipeResponse(data)) return { rows: [], totalCount: 0 };

  const resultCode = data.COOKRCP01?.RESULT?.CODE;

  if (resultCode && resultCode !== 'INFO-000') return { rows: [], totalCount: 0 };

  return {
    rows: getRecipeRows(data.COOKRCP01?.row),
    totalCount: getTotalCount(data),
  };
}

async function fetchRecipesByIngredient(
  apiKey: string,
  ingredientName: string,
  page: number,
  pageSize: number,
): Promise<FoodSafetySearchResult> {
  const searchResult: FoodSafetySearchResult = { rows: [], totalCount: 0 };

  for (const searchTerm of getSearchTerms(ingredientName)) {
    try {
      const nextResult = await fetchRecipesBySearchTerm(apiKey, searchTerm, page, pageSize);

      searchResult.rows.push(...nextResult.rows);
      searchResult.totalCount = Math.max(searchResult.totalCount, nextResult.totalCount);
    } catch (error) {
      if (error instanceof RecipeApiKeyError) throw error;
    }
  }

  return searchResult;
}

// The panel searches one API page at a time, so the first recipe view can open quickly.
export async function fetchRecipeRecommendations(
  ingredients: RecipeIngredientInput[],
  page = 1,
  pageSize = RECIPE_PAGE_SIZE,
): Promise<RecipeRecommendationPageResult> {
  if (!FOOD_SAFETY_API_KEY) {
    throw new RecipeApiKeyError();
  }

  const apiKey = FOOD_SAFETY_API_KEY;
  const safePage = getSafePage(page);
  const safePageSize = getSafePageSize(pageSize);
  const currentIngredientNames = uniqueValues(ingredients.map((ingredient) => ingredient.name));

  if (currentIngredientNames.length === 0) return getEmptyRecipePage(safePage, safePageSize);

  const recipes: RecipeRecommendation[] = [];
  let maxTotalCount = 0;

  for (const ingredientName of currentIngredientNames.slice(0, MAX_SEARCH_INGREDIENTS)) {
    try {
      const result = await fetchRecipesByIngredient(apiKey, ingredientName, safePage, safePageSize);

      maxTotalCount = Math.max(maxTotalCount, result.totalCount);

      result.rows.forEach((row) => {
        const recipe = mapRecipeRow(row, currentIngredientNames, ingredientName);

        if (recipe) recipes.push(recipe);
      });
    } catch (error) {
      if (error instanceof RecipeApiKeyError) throw error;
    }
  }

  const totalApiPages = Math.max(1, Math.ceil(maxTotalCount / safePageSize));

  return {
    recipes: mergeRecipeRecommendationList(recipes),
    page: safePage,
    pageSize: safePageSize,
    totalApiPages,
    hasMore: safePage < totalApiPages,
  };
}