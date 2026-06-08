import type { FoodItem } from '../types/food';

// 한국 가정에서 자주 쓰는 식재료를 앱 기본 목록용 우선순위로 정리합니다.
// 실제 통계 순위가 아니라, 냉장고 관리와 레시피 추천에 쓰기 좋은 기본 표시 순서입니다.
export const AVAILABLE_FOODS: FoodItem[] = [
  { id: 'green-onion', name: '대파', emoji: '🌿', rank: 1 },
  { id: 'garlic', name: '마늘', emoji: '🧄', rank: 2 },
  { id: 'onion', name: '양파', emoji: '🧅', rank: 3 },
  { id: 'egg', name: '달걀', emoji: '🥚', rank: 4 },
  { id: 'tofu', name: '두부', emoji: '◻️', rank: 5 },
  { id: 'kimchi', name: '김치', emoji: '🥬', rank: 6 },
  { id: 'pork', name: '돼지고기', emoji: '🥩', rank: 7 },
  { id: 'chicken', name: '닭고기', emoji: '🍗', rank: 8 },
  { id: 'beef', name: '소고기', emoji: '🥩', rank: 9 },
  { id: 'anchovy', name: '멸치', emoji: '🐟', rank: 10 },
  { id: 'chili-pepper', name: '고추', emoji: '🌶️', rank: 11 },
  { id: 'chili-powder', name: '고춧가루', emoji: '🌶️', rank: 12 },
  { id: 'potato', name: '감자', emoji: '🥔', rank: 13 },
  { id: 'carrot', name: '당근', emoji: '🥕', rank: 14 },
  { id: 'zucchini', name: '애호박', emoji: '🥒', rank: 15 },
  { id: 'mushroom', name: '버섯', emoji: '🍄', rank: 16 },
  { id: 'bean-sprout', name: '콩나물', emoji: '🌱', rank: 17 },
  { id: 'radish', name: '무', emoji: '⚪', rank: 18 },
  { id: 'napa-cabbage', name: '배추', emoji: '🥬', rank: 19 },
  { id: 'cucumber', name: '오이', emoji: '🥒', rank: 20 },
];