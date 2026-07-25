/**
 * Normalizes a word to its base region/city name by mapping abbreviations
 * and stripping common Korean administrative region suffixes.
 */
export function getRegionBase(word: string): string {
  let normalized = word.trim().replace(/\s+/g, '');
  if (!normalized) return '';

  // Abbreviation mapping for Korean provinces
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

  // Remove common Korean administrative suffixes
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
 * Checks if two region/location names are a match.
 * Splitting by whitespace to support combined inputs (e.g. "제주특별자치도 제주시").
 */
export function isRegionMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;

  const clean1 = name1.trim();
  const clean2 = name2.trim();

  // Split into words by whitespace
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);

  const bases1 = words1.map(getRegionBase).filter(b => b.length > 0);
  const bases2 = words2.map(getRegionBase).filter(b => b.length > 0);

  // Check if any base word from the first input matches or is safely contained
  for (const b1 of bases1) {
    for (const b2 of bases2) {
      if (b1 === b2) {
        return true;
      }
      // Require exact match if either base is short (<= 2 chars) to avoid false substring matches like "동대문" matching "대구"
      if (b1.length > 2 && b2.length > 2) {
        if (b1.includes(b2) || b2.includes(b1)) {
          return true;
        }
      }
    }
  }

  return false;
}
