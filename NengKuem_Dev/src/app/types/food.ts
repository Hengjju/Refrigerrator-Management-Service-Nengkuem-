// 식재료 목록에서 공통으로 사용하는 기본 음식 정보 타입입니다.
// rank는 왼쪽 기본 식재료 목록에서 추천 순서를 보여줄 때 사용합니다.
// iconSrc가 있으면 이모지 대신 프로젝트 안의 이미지 아이콘을 표시합니다.
export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  rank?: number;
  iconSrc?: string;
}