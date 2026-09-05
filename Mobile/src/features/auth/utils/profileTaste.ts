/**
 * 선호 테마를 세 갈래로 묶는다.
 *
 * 이름과 부제는 웹 마이페이지의 '내가 좋아하는 여행' 카드를 그대로 따른다 —
 * 장소(즐길 곳)·숙소(머무는 방식)·식당(미식 취향). 테마를 고르는 화면
 * (ThemeSelector·UpdateThemeModal)은 아직 관광지라는 이름을 쓰므로, 이 갈래
 * 이름은 지금 마이페이지에서만 쓴다.
 *
 * 웹처럼 고른 것이 없는 갈래도 자리를 지킨다. 카드 세 장이 늘 같은 자리에
 * 있어야 무엇을 고르지 않았는지 한눈에 보인다.
 *
 * 카테고리를 모르는 값은 장소로 본다 — 옛 응답이 문자열 배열만 내려주던
 * 시절의 데이터가 그렇다.
 */
const GROUPS = [
  { category: 'ATTRACTION', label: '장소', hint: '즐길 곳' },
  { category: 'ACCOMMODATION', label: '숙소', hint: '머무는 방식' },
  { category: 'RESTAURANT', label: '식당', hint: '미식 취향' },
] as const;

export type TasteGroup = { label: string; hint: string; names: string[] };

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

  return GROUPS.map(({ category, label, hint }) => ({
    label,
    hint,
    names: bucket.get(category)!,
  }));
};

/** 카드 부제에 쓰는 "선택한 취향 N개" */
export const countPreferredThemes = (groups: TasteGroup[]): number =>
  groups.reduce((total, group) => total + group.names.length, 0);
