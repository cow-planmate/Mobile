
const MIN_BASE_LENGTH = 2;

export function getRegionBase(word: string): string {
  let normalized = word.trim().replace(/\s+/g, '');
  if (!normalized) return '';

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

  const SUFFIXES = [
    /특별자치도$/,
    /특별자치시$/,
    /광역시$/,
    /특별시$/,
    /특별자치$/,
    /자치도$/,
    /자치시$/,
    /도$/,
    /시$/,
    /군$/,
    /구$/,
  ];

  for (const suffix of SUFFIXES) {
    const stripped = normalized.replace(suffix, '');
    if (stripped.length >= MIN_BASE_LENGTH) {
      normalized = stripped;
    }
  }

  return normalized;
}

export function isRegionMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;

  const clean1 = name1.trim();
  const clean2 = name2.trim();

  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);

  const bases1 = words1.map(getRegionBase).filter(b => b.length > 0);
  const bases2 = words2.map(getRegionBase).filter(b => b.length > 0);

  for (const b1 of bases1) {
    for (const b2 of bases2) {
      if (b1 === b2) {
        return true;
      }

      if (b1.length > 2 && b2.length > 2) {
        if (b1.includes(b2) || b2.includes(b1)) {
          return true;
        }
      }
    }
  }

  return false;
}
