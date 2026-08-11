import {
  getCalendarCells,
  isDateInPlanPeriod,
} from '../profileCalendar';

describe('profile calendar', () => {
  it('returns six Sunday-starting calendar rows', () => {
    const cells = getCalendarCells(new Date(2026, 7, 1));

    expect(cells).toHaveLength(42);
    expect(cells[0]).toEqual(new Date(2026, 6, 26));
    expect(cells[41]).toEqual(new Date(2026, 8, 5));
  });

  it('matches every date in an itinerary period', () => {
    expect(isDateInPlanPeriod(new Date(2026, 7, 10), '2026.08.08', '2026.08.12')).toBe(true);
    expect(isDateInPlanPeriod(new Date(2026, 7, 7), '2026.08.08', '2026.08.12')).toBe(false);
    expect(isDateInPlanPeriod(new Date(2026, 7, 13), '2026.08.08', '2026.08.12')).toBe(false);
  });
});
