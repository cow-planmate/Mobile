/**
 * 지역명에서 행정구역 접미사를 제거하고 표준 기본 명칭을 추출합니다.
 *
 * @param word 입력 지역명
 * @returns 정규화된 기본 지역명
 */
export function getRegionBase(word: string): string {
  let normalized = word.trim().replace(/\s+/g, '');
  if (!normalized) return '';

  // 광역 자치단체 약칭 매핑
  const abbreviations: { [key: string]: string } = {
    '충청북도': '충북',
    '충북': '충북',
    '충청남도': '충남',
    '충남': '충남',
    '전라북도': '전북',
    '전북': '전북',
    '전라남도': '전남',
    '전남': '전남',
    '경상북도': '경북',
    '경북': '경북',
    '경상남도': '경남',
    '경남': '경남',
  };

  for (const [key, val] of Object.entries(abbreviations)) {
    if (normalized.includes(key)) {
      return val;
    }
  }

  // 행정구역 접미사 제거
  normalized = normalized
    .replace(/특별자치도$/, '')
    .replace(/특별자치시$/, '')
    .replace(/광역시$/, '')
    .replace(/특별시$/, '')
    .replace(/특별자치$/, '')
    .replace(/자치도$/, '')
    .replace(/자치시$/, '')
    .replace(/도$/, '')
    .replace(/시$/, '')
    .replace(/군$/, '')
    .replace(/구$/, '');

  return normalized;
}

/**
 * 두 지역명이 동일한 지역을 가리키는지 일치 여부를 검증합니다.
 *
 * @param name1 비교 대상 지역명 1
 * @param name2 비교 대상 지역명 2
 * @returns 동일 지역 일치 여부
 */
export function isRegionMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;

  const clean1 = name1.trim();
  const clean2 = name2.trim();

  // 공백 기준 단어 분리
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);

  const bases1 = words1.map(getRegionBase).filter(b => b.length > 0);
  const bases2 = words2.map(getRegionBase).filter(b => b.length > 0);

  // 기본 명칭 일치 여부 검사
  for (const b1 of bases1) {
    for (const b2 of bases2) {
      if (b1 === b2) {
        return true;
      }
      // 2자 이하 짧은 단어는 오탐 방지를 위해 정확한 완전 일치만 허용
      if (b1.length > 2 && b2.length > 2) {
        if (b1.includes(b2) || b2.includes(b1)) {
          return true;
        }
      }
    }
  }

  return false;
}
