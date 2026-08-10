import { formatDateLocal, parseLocalDate } from '../timeUtils';

describe('parseLocalDate', () => {
  it("'YYYY-MM-DD'를 로컬 자정으로 파싱한다", () => {
    const d = parseLocalDate('2026-08-10');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(0);
  });

  it('formatDateLocal과 왕복해도 날짜가 밀리지 않는다', () => {
    // new Date('2026-08-10')은 UTC 자정이라 UTC보다 이른 타임존에서는
    // formatDateLocal이 전날을 돌려준다. 이 왕복이 항상 성립해야 한다.
    ['2026-01-01', '2026-08-10', '2026-12-31'].forEach(iso => {
      expect(formatDateLocal(parseLocalDate(iso))).toBe(iso);
    });
  });

  it('값이 없거나 형식이 어긋나면 Invalid Date를 돌려준다', () => {
    expect(Number.isNaN(parseLocalDate('').getTime())).toBe(true);
    expect(Number.isNaN(parseLocalDate(undefined).getTime())).toBe(true);
    expect(Number.isNaN(parseLocalDate('2026-08').getTime())).toBe(true);
  });
});
