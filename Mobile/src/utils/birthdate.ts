/**
 * 생년월일 관련 표시·변환 유틸.
 *
 * 서버는 생년월일(LocalDate)만 저장한다. 화면에 나이를 보여주더라도
 * 나이를 되돌려 생년월일을 만들어 저장하면 월·일이 소실되므로,
 * 저장은 항상 생년월일 원본으로 한다.
 */

/** 'YYYY-MM-DD' → 만 나이. 값이 없거나 형식이 어긋나면 null. */
export const toKoreanAge = (birthdate?: string | null): number | null => {
  if (!birthdate) return null;

  const [y, m, d] = birthdate.split('-').map(Number);
  if (!y || !m || !d) return null;

  const today = new Date();
  let age = today.getFullYear() - y;

  // 생일이 아직 지나지 않았으면 한 살 뺀다.
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

/** 'YYYY-MM-DD' → '1995. 08. 15.' 형태의 표시 문자열. 값이 없으면 '미설정'. */
export const formatBirthdate = (birthdate?: string | null): string => {
  if (!birthdate) return '미설정';
  const [y, m, d] = birthdate.split('-');
  if (!y || !m || !d) return '미설정';
  return `${y}. ${m}. ${d}.`;
};

/** Date → 'YYYY-MM-DD' (로컬 기준). */
export const toBirthdateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/** 'YYYY-MM-DD' → Date. 값이 없으면 기본값(20년 전 오늘). */
export const parseBirthdate = (birthdate?: string | null): Date => {
  if (birthdate) {
    const [y, m, d] = birthdate.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 20);
  return fallback;
};
