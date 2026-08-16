
export const POST_SCORE_WEIGHT = 3;
export const COMMENT_SCORE_WEIGHT = 1;

export interface LevelTier {
  level: number;
  name: string;

  min: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: '여행 입문자', min: 0 },
  { level: 2, name: '여행 애호가', min: 10 },
  { level: 3, name: '여행 전문가', min: 30 },
  { level: 4, name: '여행 마스터', min: 70 },
  { level: 5, name: '여행 레전드', min: 150 },
];

export const levelName = (level: number): string =>
  (LEVEL_TIERS.find(tier => tier.level === level) ?? LEVEL_TIERS[0]).name;

export const LEVEL_BADGE_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#F3F4F6', text: '#6B7280' },
  2: { bg: '#DBEAFE', text: '#2563EB' },
  3: { bg: '#E0F2FE', text: '#0369A1' },
  4: { bg: '#FEF3C7', text: '#D97706' },
  5: { bg: '#FEE2E2', text: '#EF4444' },
};

export const levelBadgeColor = (level: number) =>
  LEVEL_BADGE_COLORS[level] ?? LEVEL_BADGE_COLORS[1];

export const getActivityScore = (postCount: number, commentCount: number) =>
  Math.max(0, postCount) * POST_SCORE_WEIGHT +
  Math.max(0, commentCount) * COMMENT_SCORE_WEIGHT;

export const getLevelProgress = (postCount: number, commentCount: number) => {
  const score = getActivityScore(postCount, commentCount);
  const currentTier =
    [...LEVEL_TIERS].reverse().find(tier => score >= tier.min) ?? LEVEL_TIERS[0];
  const nextTier = LEVEL_TIERS.find(tier => tier.min > currentTier.min);

  if (!nextTier) {
    return { score, currentTier, nextTier: null, progressPercent: 100 };
  }

  const progressPercent = Math.min(
    100,
    ((score - currentTier.min) / (nextTier.min - currentTier.min)) * 100,
  );

  return { score, currentTier, nextTier, progressPercent };
};

export const BOARDS = [
  { key: 'free', label: '자유게시판' },
  { key: 'qna', label: 'Q&A' },
  { key: 'mate', label: '메이트 찾기' },
  { key: 'recommend', label: '장소 추천' },
] as const;

export type BoardKey = (typeof BOARDS)[number]['key'];

export const boardLabel = (key: string): string =>
  BOARDS.find(board => board.key === key)?.label ?? key;
