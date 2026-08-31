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
