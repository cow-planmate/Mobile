/**
 * 일정 편집 화면에 처음 들어온 사람에게 버튼을 하나씩 짚어 주는 순서.
 *
 * 화면을 위에서 아래로 훑지 않고 일정을 실제로 짜는 순서를 따른다 - 정보를 보고,
 * 날짜를 고르고, 장소를 담고, 시간을 맞추고, 사람을 부르고, 맨 끝에 완성한다.
 * 위치 순서로 훑으면 버튼 이름만 나열될 뿐 무엇부터 해야 하는지가 남지 않는다.
 *
 * 이 화면에만 넣는다. 홈은 칸마다 '여행지를 선택해 주세요'처럼 안내가 이미 적혀
 * 있고 탭에는 글자 라벨이 붙어 있으며, 여행기의 가져오기는 상세 화면 맨 아래
 * 전체 폭 파란 버튼이라 짚어 줄 것이 없다.
 */

export type CoachmarkTargetId =
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

/**
 * 짚어 준 자리 위에서 보여 줄 손짓.
 *
 * '끌어올리면'이라고 적어 두기만 하면 어디를 잡아 어느 쪽으로 끄는지가
 * 남지 않는다. 잡는 자리와 끌려가는 거리만 정해 두면 안내가 대신 해 보인다.
 */
export interface CoachmarkDemo {
  /**
   * 무엇까지 보여 줄지.
   *
   * - point: 손가락만 움직인다.
   * - carry: 카드를 들고 가서 놓이는 자리까지 보여 준다.
   * - grow: 끈 만큼 그 자리가 옅게 늘어나는 것까지 보여 준다.
   */
  kind: 'point' | 'carry' | 'grow';
  /** 손가락이 닿는 자리. 짚은 자리 안에서의 비율(0이 왼쪽·위, 1이 오른쪽·아래). */
  fromX: number;
  fromY: number;
  /** 거기서 끌려가는 거리(px). */
  dx: number;
  dy: number;
}

export interface CoachmarkStep {
  target: CoachmarkTargetId;
  title: string;
  /** 두 줄을 넘기지 않는다. 길어지면 읽지 않고 닫는다. */
  body: string;
  shape: CoachmarkShape;
  /** 구멍을 대상보다 얼마나 넉넉히 뚫을지(px). */
  padding?: number;
  /** 말로만으로는 손짓이 안 그려지는 두 단계에 붙인다. */
  demo?: CoachmarkDemo;
  /**
   * 말풍선을 짚은 것 옆이 아니라 화면 반대쪽 끝에 둔다.
   *
   * 손짓이 짚은 것 밖으로 멀리 나가는 단계에서, 말풍선이 그 길 위에 앉아
   * 카드가 뒤로 사라져 버리는 것을 막는다.
   */
  tipAway?: boolean;
  /**
   * 본문 아래에 따로 붙이는 한마디. 모르면 손해 보는 것만 적는다.
   *
   * 본문에 이어 붙이면 세 줄이 되어 읽히지 않는다. 자리를 나누고 옅은 바탕을
   * 깔아 '읽고 넘어가는 줄'로 보이게 한다.
   */
  note?: string;
  /**
   * 안내 중에 이 버튼을 실제로 눌러 볼 수 있는지. 기본은 눌러 볼 수 있다 -
   * 직접 한 번 해보고 다음 단계로 넘어가는 것이 안내의 목적이다.
   *
   * false로 막는 것은 눌리면 되돌릴 수 없는 셋뿐이다. 일정 완성은 저장하고
   * 화면을 떠나 이어서 볼 안내가 없어지고, 되돌리기는 진짜로 직전 작업을
   * 무르며, 수정·삭제는 구멍 하나에 연필과 X가 같이 들어가 삭제만 막을 수 없다.
   */
  interactive?: boolean;
}

export const EDITOR_COACHMARK_STEPS: readonly CoachmarkStep[] = [
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
    // 장소 한 줄을 꾹 눌러 시간표에 놓는 데까지. 말풍선은 위로 치워 둔다 -
    // 패널과 시간표 사이에 앉아 있으면 들고 가는 카드가 그 뒤로 사라진다.
    demo: { kind: 'carry', fromX: 0.35, fromY: 0.45, dx: 0, dy: -330 },
    tipAway: true,
  },
  {
    target: 'timelineBlock',
    title: '시간 조절',
    body: '위아래 회색 손잡이를 끌면 머무는 시간이 늘고, 블록째 끌면 시간대가 옮겨져요.',
    shape: 'rounded',
    // 위쪽 손잡이를 잡고 위로. 아래쪽 손잡이는 말풍선이 바로 밑에 붙어
    // 늘어나는 자리가 가려진다. 110px은 시간표 눈금으로 30분쯤이다.
    demo: { kind: 'grow', fromX: 0.5, fromY: 0, dx: 0, dy: -110 },
  },
  {
    target: 'blockActions',
    title: '수정과 삭제',
    body: '연필은 자세히 고치기, X는 지우기예요. 지운 건 되돌리기로 살릴 수 있어요.',
    shape: 'rounded',
    interactive: false,
  },
  {
    target: 'undo',
    title: '되돌리기',
    body: '방금 한 동작을 한 단계씩 취소해요. 잘못 옮겼을 때 바로 되돌립니다.',
    shape: 'circle',
    interactive: false,
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
  {
    target: 'complete',
    title: '일정 완성',
    body: '다 짰으면 눌러서 완성해요. 완성한 뒤에도 연필로 다시 열 수 있어요.',
    note: '누르지 않고 나가도 괜찮아요. 고친 내용은 그때그때 저장됩니다.',
    shape: 'circle',
    interactive: false,
  },
];
