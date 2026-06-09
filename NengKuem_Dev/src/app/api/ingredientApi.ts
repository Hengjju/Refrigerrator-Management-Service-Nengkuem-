import { supabase } from './supabaseClient';
import type { FoodItem } from '../types/food';
import type { StoredFoodItem, StorageSection } from '../types/ingredient';

interface IngredientRow {
  id: string;
  user_id: string;
  food_id: string;
  name: string;
  custom_name: string | null;
  emoji: string;
  rank: number | null;
  icon_src: string | null;
  storage_section: StorageSection;
  expiry_date: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

interface IngredientUpdateValues {
  section?: StorageSection;
  customName?: string;
  expiryDate?: string;
  memo?: string;
}

const INGREDIENT_SELECT =
  'id,user_id,food_id,name,custom_name,emoji,rank,icon_src,storage_section,expiry_date,memo,created_at,updated_at';

const SUPABASE_CONFIG_MESSAGE =
  'Supabase 설정값이 없습니다. .env.local의 URL과 publishable key를 확인해주세요.';
const INGREDIENT_TABLE_MESSAGE =
  'Supabase SQL Editor에서 ingredients 테이블 생성 SQL을 먼저 실행해주세요.';

const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIG_MESSAGE);
  }

  return supabase;
};

const getIngredientErrorMessage = (message?: string) => {
  const normalizedMessage = (message || '').toLowerCase();

  if (
    normalizedMessage.includes('relation') && normalizedMessage.includes('ingredients') ||
    normalizedMessage.includes('could not find the table') ||
    normalizedMessage.includes('schema cache')
  ) {
    return INGREDIENT_TABLE_MESSAGE;
  }

  if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('violates row-level security')) {
    return 'ingredients 테이블의 RLS 정책을 확인해주세요.';
  }

  if (normalizedMessage.includes('jwt') || normalizedMessage.includes('not authenticated')) {
    return '로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
  }

  return '식재료 저장소와 통신하는 중 문제가 생겼습니다.';
};

const getCurrentUserId = async () => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  return data.user.id;
};

const mapIngredientRowToItem = (row: IngredientRow): StoredFoodItem => ({
  id: row.food_id,
  uniqueId: row.id,
  name: row.name,
  emoji: row.emoji,
  rank: row.rank ?? undefined,
  iconSrc: row.icon_src ?? undefined,
  section: row.storage_section,
  customName: row.custom_name ?? undefined,
  expiryDate: row.expiry_date ?? undefined,
  memo: row.memo ?? undefined,
});

export const fetchUserIngredients = async () => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('ingredients')
    .select(INGREDIENT_SELECT)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(getIngredientErrorMessage(error.message));
  }

  return ((data || []) as IngredientRow[]).map(mapIngredientRowToItem);
};

export const createIngredientItem = async (food: FoodItem, section: StorageSection) => {
  const client = getSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await client
    .from('ingredients')
    .insert({
      user_id: userId,
      food_id: food.id,
      name: food.name,
      emoji: food.emoji,
      rank: food.rank ?? null,
      icon_src: food.iconSrc ?? null,
      storage_section: section,
    })
    .select(INGREDIENT_SELECT)
    .single();

  if (error) {
    throw new Error(getIngredientErrorMessage(error.message));
  }

  return mapIngredientRowToItem(data as IngredientRow);
};

export const updateIngredientItem = async (itemId: string, values: IngredientUpdateValues) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('ingredients')
    .update({
      storage_section: values.section,
      custom_name: values.customName ?? null,
      expiry_date: values.expiryDate ?? null,
      memo: values.memo ?? null,
    })
    .eq('id', itemId)
    .select(INGREDIENT_SELECT)
    .single();

  if (error) {
    throw new Error(getIngredientErrorMessage(error.message));
  }

  return mapIngredientRowToItem(data as IngredientRow);
};

export const deleteIngredientItems = async (itemIds: string[]) => {
  if (itemIds.length === 0) return;

  const client = getSupabaseClient();
  const { error } = await client.from('ingredients').delete().in('id', itemIds);

  if (error) {
    throw new Error(getIngredientErrorMessage(error.message));
  }
};
