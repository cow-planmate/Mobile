
export const toKoreanAge = (birthdate?: string | null): number | null => {
  if (!birthdate) return null;

  const [y, m, d] = birthdate.split('-').map(Number);
  if (!y || !m || !d) return null;

  const today = new Date();
  let age = today.getFullYear() - y;

  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export const formatBirthdate = (birthdate?: string | null): string => {
  if (!birthdate) return '미설정';
  const [y, m, d] = birthdate.split('-');
  if (!y || !m || !d) return '미설정';
  return `${y}. ${m}. ${d}.`;
};

export const toBirthdateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const parseBirthdate = (birthdate?: string | null): Date => {
  if (birthdate) {
    const [y, m, d] = birthdate.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 20);
  return fallback;
};
