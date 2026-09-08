import { parseLocalDate } from '../../../utils/timeUtils';

export const getCalendarCells = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - firstDay.getDay(),
  );
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export const toPlanDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = parseLocalDate(value.replace(/\./g, '-').substring(0, 10));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const isDateInPlanPeriod = (
  date: Date,
  startDate?: string,
  endDate?: string,
) => {
  const start = toPlanDate(startDate);
  const end = toPlanDate(endDate) ?? start;
  if (!start || !end) return false;
  const value = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  return value >= start.getTime() && value <= end.getTime();
};

export const getCalendarPlanLanes = (
  cells: Date[],
  plans: {
    planId: string;
    planName: string;
    startDate?: string;
    endDate?: string;
  }[],
) => {
  const ranges = plans
    .flatMap(plan => {
      const indices = cells.flatMap((date, index) =>
        isDateInPlanPeriod(date, plan.startDate, plan.endDate) ? [index] : [],
      );
      return indices.length
        ? [
            {
              ...plan,
              startIndex: indices[0],
              endIndex: indices[indices.length - 1],
            },
          ]
        : [];
    })
    .sort(
      (a, b) =>
        a.startIndex - b.startIndex ||
        b.endIndex - a.endIndex ||
        a.planId.localeCompare(b.planId),
    );
  const laneEnds: number[] = [];
  return ranges.map(range => {
    const freeLane = laneEnds.findIndex(end => end < range.startIndex);
    const lane = freeLane < 0 ? laneEnds.length : freeLane;
    laneEnds[lane] = range.endIndex;
    return { ...range, lane };
  });
};
