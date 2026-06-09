interface FoodIconProps {
  emoji: string;
  iconSrc?: string;
  name?: string;
  emojiClassName: string;
  imageClassName: string;
}

// 식재료별 전용 이미지가 있으면 이미지를, 없으면 기존 이모지를 보여주는 공통 아이콘입니다.
export function FoodIcon({ emoji, iconSrc, name = '', emojiClassName, imageClassName }: FoodIconProps) {
  if (iconSrc) {
    return <img src={iconSrc} alt={name} className={imageClassName} draggable={false} />;
  }

  return <span className={emojiClassName}>{emoji}</span>;
}