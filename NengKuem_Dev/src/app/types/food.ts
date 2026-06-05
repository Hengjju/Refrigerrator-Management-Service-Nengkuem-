// 식재료 목록에서 공통으로 사용하는 기본 음식 정보 타입입니다.
// 아직 냉장고에 저장되는 데이터는 아니고, 화면에 보여줄 카탈로그 데이터입니다.
export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
}
