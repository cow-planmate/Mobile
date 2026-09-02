export const POST_TITLE_MAX_LENGTH = 100;

export const BOARDS = [
  { key: 'free', label: '자유게시판' },
  { key: 'qna', label: 'Q&A' },
  { key: 'recommend', label: '장소 추천' },
] as const;

/**
 * 더 이상 고를 수 없지만 이미 올라간 글이 있는 갈래.
 *
 * 목록에서 빼기만 하면 그 글의 갈래 이름 자리에 'mate'라는 날것이 뜬다.
 * 쓰던 사람의 글을 망가뜨리지 않도록 이름은 남긴다.
 */
const RETIRED_BOARD_LABELS: Record<string, string> = {
  mate: '메이트 찾기',
};

export type BoardKey = (typeof BOARDS)[number]['key'];

export const boardLabel = (key: string): string =>
  BOARDS.find(board => board.key === key)?.label ??
  RETIRED_BOARD_LABELS[key] ??
  key;

export const SORT_OPTIONS = [
  { key: 'latest', label: '최신순' },
  { key: 'likes', label: '추천순' },
  { key: 'views', label: '조회순' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['key'];
