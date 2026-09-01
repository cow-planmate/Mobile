/**
 * 선호 테마를 세 갈래로 묶는다.
 *
 * 이름은 테마를 고르는 화면(ThemeSelector·UpdateThemeModal)과 일정 화면이 이미
 * 쓰는 관광지·숙소·식당을 그대로 쓴다. 같은 것을 두 이름으로 부르지 않는다.
 * 카테고리를 모르는 값은 관광지로 본다 — 옛 응답이 문자열 배열만 내려주던
 * 시절의 데이터가 그렇다.
 */
const GROUPS = [
  { category: 'ATTRACTION', label: '관광지' },
  { category: 'ACCOMMODATION', label: '숙소' },
  { category: 'RESTAURANT', label: '식당' },
] as const;

export type TasteGroup = { label: string; names: string[] };

type RawTheme = string | { preferredThemeName?: string; category?: string };

export const groupPreferredThemes = (themes: RawTheme[]): TasteGroup[] => {
  const bucket = new Map<string, string[]>(
    GROUPS.map(({ category }) => [category, [] as string[]]),
  );

  themes.forEach(theme => {
    const name = (
      typeof theme === 'string' ? theme : theme?.preferredThemeName ?? ''
    ).trim();
    if (!name) return;

    const rawCategory = typeof theme === 'string' ? '' : theme?.category ?? '';
    const category = bucket.has(rawCategory) ? rawCategory : 'ATTRACTION';
    bucket.get(category)!.push(name.replace(/^#/, ''));
  });

  return GROUPS.map(({ category, label }) => ({
    label,
    names: bucket.get(category)!,
  })).filter(group => group.names.length > 0);
};
