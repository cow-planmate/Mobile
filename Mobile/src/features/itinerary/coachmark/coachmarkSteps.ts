/**
 * 일정 편집 화면에 처음 들어온 사람에게 버튼을 하나씩 짚어 주는 순서.
 *
 * 화면을 위에서 아래로 훑지 않고 일정을 실제로 짜는 순서를 따른다 - 이름을 짓고,
 * 날짜를 고르고, 장소를 담고, 시간을 맞추고, 사람을 부르고, 완성한다. 위치 순서로
 * 훑으면 버튼 이름만 나열될 뿐 무엇부터 해야 하는지가 남지 않는다.
 *
 * 이 화면에만 넣는다. 홈은 칸마다 '여행지를 선택해 주세요'처럼 안내가 이미 적혀
 * 있고 탭에는 글자 라벨이 붙어 있으며, 여행기의 가져오기는 상세 화면 맨 아래
 * 전체 폭 파란 버튼이라 짚어 줄 것이 없다.
 */

export type CoachmarkTargetId =
  | 'planName'
  | 'planInfo'
  | 'dayTabs'
  | 'dayPeriod'
  | 'placeSheet'
  | 'timelineBlock'
  | 'complete'
  | 'blockActions'
  | 'undo'
  | 'checklist'
  | 'participants'
  | 'invite'
  | 'map';

/**
 * 구멍의 모서리를 어떻게 깎을지. 동그란 아이콘 버튼은 반지름을 반으로 줘야
 * 사각 테두리가 원 밖으로 삐져나오지 않는다.
 */
export type CoachmarkShape = 'circle' | 'rounded';

export interface CoachmarkStep {
  target: CoachmarkTargetId;
  title: string;
  /** 두 줄을 넘기지 않는다. 길어지면 읽지 않고 닫는다. */
  body: string;
  shape: CoachmarkShape;
  /** 구멍을 대상보다 얼마나 넉넉히 뚫을지(px). */
  padding?: number;
}

export const EDITOR_COACHMARK_STEPS: readonly CoachmarkStep[] = [
  {
    target: 'planName',
    title: '일정 이름',
    body: '이름을 눌러 바로 고칠 수 있어요. 따로 저장하지 않아도 됩니다.',
    shape: 'rounded',
  },
  {
    target: 'planInfo',
    title: '일정 정보',
    body: '여행지·기간·인원 같은 기본 정보를 여기서 보고 바꿔요.',
    shape: 'circle',
  },
  {
    target: 'dayTabs',
    title: '며칠차 고르기',
    body: '탭을 옮기면 아래 시간표가 그 날짜로 바뀌어요.',
    shape: 'rounded',
  },
  {
    target: 'dayPeriod',
    title: '여행 기간 바꾸기',
    body: '여행 날짜를 늘리거나 줄여요. 일차가 함께 늘고 줄어듭니다.',
    shape: 'circle',
  },
  {
    target: 'placeSheet',
    title: '장소 담기',
    body: '관광지·숙소·식당 중에 고르고 패널을 위로 끌어올리면 장소 목록이 나와요.',
    shape: 'rounded',
    padding: 0,
  },
  {
    target: 'timelineBlock',
    title: '시간 조절',
    body: '위아래 회색 손잡이를 끌면 머무는 시간이 늘고, 블록째 끌면 시간대가 옮겨져요.',
    shape: 'rounded',
  },
  {
    target: 'complete',
    title: '일정 완성',
    body: '다 짰으면 눌러서 완성해요. 완성한 뒤에도 연필로 다시 열 수 있습니다.',
    shape: 'circle',
  },
  {
    target: 'blockActions',
    title: '수정과 삭제',
    body: '연필은 자세히 고치기, X는 지우기예요. 지운 건 되돌리기로 살릴 수 있어요.',
    shape: 'rounded',
  },
  {
    target: 'undo',
    title: '되돌리기',
    body: '방금 한 동작을 한 단계씩 취소해요. 잘못 옮겼을 때 바로 되돌립니다.',
    shape: 'circle',
  },
  {
    target: 'checklist',
    title: '체크리스트',
    body: '챙길 짐과 할 일을 적어두는 곳이에요. 같이 가는 사람도 함께 봅니다.',
    shape: 'circle',
  },
  {
    target: 'participants',
    title: '참여자',
    body: '함께 편집하는 사람 목록이에요. 빨간 숫자는 지금 참여 중인 인원입니다.',
    shape: 'circle',
  },
  {
    target: 'invite',
    title: '친구 초대',
    body: '링크로 친구를 불러요. 초대받은 사람은 같이 고칠 수 있습니다.',
    shape: 'circle',
  },
  {
    target: 'map',
    title: '동선 보기',
    body: '담은 장소를 지도 위에 순서대로 펼쳐요. 동선이 꼬였는지 여기서 확인해요.',
    shape: 'circle',
  },
];
