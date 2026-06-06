import type { FoodItem } from './food';

// 냉장고 안에서 식재료가 보관될 수 있는 위치입니다.
export type StorageSection = 'freezer' | 'fridge';

// 냉장고에 들어간 식재료 한 개를 표현하는 타입입니다.
// 7단계부터는 사용자가 바꾼 표시 이름(customName)을 함께 저장할 수 있습니다.
export interface StoredFoodItem extends FoodItem {
  uniqueId: string;
  section: StorageSection;
  customName?: string;
}
