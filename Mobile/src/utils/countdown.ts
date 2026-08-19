/**
 * 남은 초를 1씩 감산하면 앱이 백그라운드에 있는 동안 JS 타이머가 멈춰 실제
 * 경과 시간과 어긋난다. 만료 시각을 기준으로 매 틱마다 다시 계산해야 복귀
 * 후에도 화면의 남은 시간이 서버의 만료 시점과 일치한다.
 */
export const secondsUntil = (deadlineMs: number, nowMs = Date.now()): number =>
  Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));

export const deadlineFromNow = (seconds: number, nowMs = Date.now()): number =>
  nowMs + seconds * 1000;
