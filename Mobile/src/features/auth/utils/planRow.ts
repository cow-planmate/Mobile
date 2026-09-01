import { toPlanDate } from './profileCalendar';

/**
 * 마이페이지 일정 행 왼쪽 레일에 들어갈 값.
 *
 * 예정된 일정은 D-day를, 지난 일정은 출발 날짜를 세운다. 지난 여행에서
 * "며칠 지났나(D+17)"는 아무 것도 알려주지 않고, "언제 갔나"가 궁금하기 때문이다.
 */
export type PlanRail = { value: string; caption: string };

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/** 오늘부터 출발일까지 남은 날. 출발일이 없으면 undefined. */
export const getDaysUntilStart = (startDate?: string): number | undefined => {
  const start = toPlanDate(startDate);
  if (!start) return undefined;
  const diff = start.getTime() - startOfToday().getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

/** 예정된 일정 레일 — D-1 / 내일 */
export const getUpcomingRail = (startDate?: string): PlanRail => {
  const days = getDaysUntilStart(startDate);
  if (days === undefined) return { value: 'D-Day', caption: '날짜 미정' };
  if (days === 0) return { value: 'D-Day', caption: '오늘' };
  if (days === 1) return { value: 'D-1', caption: '내일' };
  if (days < 0) return { value: `D+${Math.abs(days)}`, caption: '지남' };

  const start = toPlanDate(startDate)!;
  return {
    value: `D-${days}`,
    caption: `${start.getMonth() + 1}월 ${start.getDate()}일`,
  };
};

/** 지난 일정 레일 — 8/15 / 2026 */
export const getPastRail = (startDate?: string): PlanRail => {
  const start = toPlanDate(startDate);
  if (!start) return { value: '—', caption: '날짜 없음' };
  return {
    value: `${start.getMonth() + 1}/${start.getDate()}`,
    caption: `${start.getFullYear()}`,
  };
};

/** 2박 3일. 끝 날짜가 없으면 당일치기로 본다. */
export const getTripDuration = (
  startDate?: string,
  endDate?: string,
): string | undefined => {
  const start = toPlanDate(startDate);
  if (!start) return undefined;
  const end = toPlanDate(endDate) ?? start;
  const nights = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`;
};
