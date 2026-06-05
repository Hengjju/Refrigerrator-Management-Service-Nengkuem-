import type { FoodItem } from '../types/food';

// 2단계에서는 기능 없이 왼쪽 식재료 목록에 보여줄 기본 데이터만 준비합니다.
export const AVAILABLE_FOODS: FoodItem[] = [
  { id: 'egg', name: '달걀', emoji: '🥚' },
  { id: 'milk', name: '우유', emoji: '🥛' },
  { id: 'cheese', name: '치즈', emoji: '🧀' },
  { id: 'apple', name: '사과', emoji: '🍎' },
  { id: 'lettuce', name: '상추', emoji: '🥬' },
  { id: 'tomato', name: '토마토', emoji: '🍅' },
  { id: 'meat', name: '고기', emoji: '🥩' },
  { id: 'fish', name: '생선', emoji: '🐟' },
  { id: 'rice', name: '밥', emoji: '🍚' },
  { id: 'kimchi', name: '김치', emoji: '🥬' },
];
