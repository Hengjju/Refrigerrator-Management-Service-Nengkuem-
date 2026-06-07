export type ExpiryStatus = 'plenty' | 'soon' | 'urgent' | 'today' | 'expired';

export interface ExpiryDdayInfo {
  label: string;
  status: ExpiryStatus;
  statusLabel: string;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

// input 날짜값(YYYY-MM-DD)을 카드에 보여줄 한국식 구분자 형태로 바꿉니다.
export function formatExpiryDate(expiryDate?: string) {
  if (!expiryDate) return null;

  return expiryDate.replaceAll('-', '.');
}

// 브라우저 시간대 영향을 줄이기 위해 날짜의 시작 시각만 따로 계산합니다.
function getLocalDateStart(dateText: string) {
  const [year, month, day] = dateText.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

// 유통기한을 오늘 기준으로 비교해서 카드와 필터에서 함께 쓸 D-day 상태를 만듭니다.
export function getExpiryDdayInfo(expiryDate?: string): ExpiryDdayInfo | null {
  if (!expiryDate) return null;

  const expiry = getLocalDateStart(expiryDate);
  if (!expiry) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayGap = Math.round((expiry.getTime() - today.getTime()) / DAY_IN_MS);

  if (dayGap < 0) {
    return { label: `D+${Math.abs(dayGap)}`, status: 'expired', statusLabel: '만료' };
  }

  if (dayGap === 0) {
    return { label: 'D-day', status: 'today', statusLabel: '오늘' };
  }

  if (dayGap <= 3) {
    return { label: `D-${dayGap}`, status: 'urgent', statusLabel: '임박' };
  }

  if (dayGap <= 7) {
    return { label: `D-${dayGap}`, status: 'soon', statusLabel: '얼마 안남음' };
  }

  return { label: `D-${dayGap}`, status: 'plenty', statusLabel: '많이 남음' };
}