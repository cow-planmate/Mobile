/** 날짜 탭 밑줄이 다음 탭으로 미끄러질 때의 스프링. 반동 없이 내려앉는다. */
export const DAY_UNDERLINE_SPRING = {
  mass: 1,
  damping: 26,
  stiffness: 320,
  overshootClamping: true,
};

/** 일차를 넘기면 시간표가 이 시간(ms) 동안 나타난다. */
export const DAY_SWITCH_DURATION = 220;
/** 시간표가 넘어가는 방향에서 이만큼(dp) 밀려 들어온다. */
export const DAY_SWITCH_SHIFT = 20;

/**
 * 일차가 바뀐 방향. 뒤 일차로 가면 1, 앞 일차로 가면 -1,
 * 같거나 알 수 없으면 0이다.
 */
export const getDaySwitchDirection = (
  from: number | undefined,
  to: number | undefined,
) => {
  if (from === undefined || to === undefined || from === to) return 0;
  return to > from ? 1 : -1;
};
