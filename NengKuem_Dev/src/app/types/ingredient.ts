import type { FoodItem } from './food';

// 냉장고 안에서 식재료가 보관될 수 있는 위치입니다.
export type StorageSection = 'freezer' | 'fridge';

// 냉장고에 들어간 식재료 한 개를 표현하는 타입입니다.
// 3단계에서는 구조만 준비하고, 실제 추가 기능은 다음 단계에서 연결합니다.
export interface StoredFoodItem extends FoodItem {
  uniqueId: string;
  section: StorageSection;
}
