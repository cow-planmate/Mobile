export const POST_TITLE_MAX_LENGTH = 100;

export const BOARDS = [
  { key: 'free', label: '자유게시판' },
  { key: 'qna', label: '질문게시판' },
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

/**
 * 게시판별 작성 팁. 웹 GuidelineSection 문구를 옮기되, 앱에 없는 기능을 안내하는 줄은 뺐다.
 * 앱 본문은 평문이라 서식('/' 명령)도 이미지 첨부도 할 수 없어서, 그대로 두면 거짓말이 된다.
 */
export const BOARD_TIPS: Record<BoardKey, string[]> = {
  free: [
    '여행과 관련된 즐거운 이야기를 들려주세요.',
    '서로 존중하는 따뜻한 커뮤니티를 만들어가요.',
  ],
  qna: [
    '질문 제목에 핵심 키워드를 넣으면 답변을 더 빨리 받을 수 있어요.',
    '현재 상황(누구와, 언제, 예산 등)을 상세히 적어주세요.',
    '도움이 된 답변에는 꼭 감사의 인사를 전해주세요!',
  ],
  recommend: [
    '장소의 특징, 분위기, 방문 꿀팁을 자세히 공유해주세요.',
    '정확한 위치와 주차, 영업시간 정보를 함께 적어주세요.',
  ],
};
