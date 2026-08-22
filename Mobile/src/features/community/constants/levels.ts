import { tokens } from '../../../theme/tokens';

// 서버(UserStatsRepository.recalculateLevel)의 레벨 산정 로직을 그대로 미러링한다.
// 진행률 바 표시용으로만 쓰이며, 실제 Lv.N 배지는 서버가 내려주는 MyStats.level을
// 사용하므로 백엔드 기준이 바뀌면 이 값도 함께 맞춰야 한다.
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
  1: { bg: tokens.colors.borderLight, text: tokens.colors.textSecondary },
  2: { bg: '#DBEAFE', text: '#2563EB' },
  3: { bg: '#F3E8FF', text: '#9333EA' },
  4: { bg: '#FFEDD5', text: '#EA580C' },
  5: { bg: '#F59E0B', text: tokens.colors.white },
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

// 게시글·여행기 작성 화면이 공통으로 쓰는 제목 길이 상한.
// 커뮤니티는 별도 서비스라 서버 제약을 워크스페이스에서 확인할 수 없어,
// 두 화면에 흩어져 있던 기존 값(100)을 그대로 한곳에 모아둔다.
export const POST_TITLE_MAX_LENGTH = 100;

export const BOARDS = [
  { key: 'free', label: '자유게시판' },
  { key: 'qna', label: 'Q&A' },
  { key: 'mate', label: '메이트 찾기' },
  { key: 'recommend', label: '장소 추천' },
] as const;

export type BoardKey = (typeof BOARDS)[number]['key'];

export const boardLabel = (key: string): string =>
  BOARDS.find(board => board.key === key)?.label ?? key;

export const SORT_OPTIONS = [
  { key: 'latest', label: '최신순' },
  { key: 'likes', label: '추천순' },
  { key: 'views', label: '조회순' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['key'];
