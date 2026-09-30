import {
  formatDateDot,
  formatMonthDayDot,
  formatPeriod,
  normalizeTime,
} from '../timeUtils';

describe('formatDateDot', () => {
  it('월·일을 0으로 채워 점으로 잇는다', () => {
    expect(formatDateDot(new Date(2026, 7, 2))).toBe('2026.08.02');
    expect(formatDateDot('2026-12-31')).toBe('2026.12.31');
  });

  it('Date와 문자열 어느 쪽을 넣어도 같은 결과다', () => {
    expect(formatDateDot('2026-08-22')).toBe(formatDateDot(new Date(2026, 7, 22)));
  });

  it('값이 없거나 형식이 어긋나면 빈 문자열이다', () => {
    expect(formatDateDot(null)).toBe('');
    expect(formatDateDot(undefined)).toBe('');
    expect(formatDateDot('2026-08')).toBe('');
  });
});

describe('formatMonthDayDot', () => {
  it('연도 없이 월·일만 남긴다', () => {
    expect(formatMonthDayDot('2026-08-02')).toBe('08.02');
  });

  it('끝에 점을 붙이지 않는다', () => {
    expect(formatMonthDayDot('2026-08-22').endsWith('.')).toBe(false);
  });
});

describe('formatPeriod', () => {
  it('시작과 종료를 물결로 잇는다', () => {
    expect(formatPeriod('2026-08-22', '2026-08-25')).toBe(
      '2026.08.22 ~ 2026.08.25',
    );
  });

  it('같은 날이면 날짜 하나만 보여준다', () => {
    expect(formatPeriod('2026-08-22', '2026-08-22')).toBe('2026.08.22');
  });

  it('한쪽이 비면 있는 쪽만 보여준다', () => {
    expect(formatPeriod('2026-08-22', null)).toBe('2026.08.22');
    expect(formatPeriod(null, '2026-08-25')).toBe('2026.08.25');
    expect(formatPeriod(null, null)).toBe('');
  });

  it('해를 넘겨도 양쪽 연도를 모두 보여준다', () => {
    expect(formatPeriod('2026-12-30', '2027-01-02')).toBe(
      '2026.12.30 ~ 2027.01.02',
    );
  });
});

describe('normalizeTime', () => {
  it('초가 붙어 있어도 시·분만 남긴다', () => {
    expect(normalizeTime('09:00:00')).toBe('09:00');
    expect(normalizeTime('09:00')).toBe('09:00');
  });

  it('값이 없으면 빈 문자열이다', () => {
    expect(normalizeTime(null)).toBe('');
    expect(normalizeTime(undefined)).toBe('');
  });
});
