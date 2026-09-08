import {
  getCalendarCells,
  getCalendarPlanLanes,
  isDateInPlanPeriod,
} from '../profileCalendar';

describe('profile calendar', () => {
  it('여러 주에 걸친 여행도 하나의 기간으로 유지하고 겹치는 여행은 다른 줄에 둔다', () => {
    const cells = getCalendarCells(new Date(2026, 8, 1));
    const plans = [
      {
        planId: 'a',
        planName: '제주',
        startDate: '2026.09.01',
        endDate: '2026.09.10',
      },
      {
        planId: 'b',
        planName: '부산',
        startDate: '2026.09.05',
        endDate: '2026.09.08',
      },
      {
        planId: 'c',
        planName: '서울',
        startDate: '2026.09.11',
        endDate: '2026.09.12',
      },
      { planId: 'd', planName: '미정' },
    ];
    const lanes = getCalendarPlanLanes(cells, plans);
    expect(lanes).toHaveLength(3);
    expect(lanes[0].endIndex - lanes[0].startIndex).toBe(9);
    expect(lanes[0].lane).not.toBe(lanes[1].lane);
    expect(lanes[2].lane).toBe(lanes[0].lane);
    expect(getCalendarPlanLanes(cells, [...plans].reverse())).toEqual(lanes);
  });
  it('returns six Sunday-starting calendar rows', () => {
    const cells = getCalendarCells(new Date(2026, 7, 1));

    expect(cells).toHaveLength(42);
    expect(cells[0]).toEqual(new Date(2026, 6, 26));
    expect(cells[41]).toEqual(new Date(2026, 8, 5));
  });

  it('matches every date in an itinerary period', () => {
    expect(
      isDateInPlanPeriod(new Date(2026, 7, 10), '2026.08.08', '2026.08.12'),
    ).toBe(true);
    expect(
      isDateInPlanPeriod(new Date(2026, 7, 7), '2026.08.08', '2026.08.12'),
    ).toBe(false);
    expect(
      isDateInPlanPeriod(new Date(2026, 7, 13), '2026.08.08', '2026.08.12'),
    ).toBe(false);
  });
});
