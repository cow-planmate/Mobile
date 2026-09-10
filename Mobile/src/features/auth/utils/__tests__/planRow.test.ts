import {
  getPastRail,
  getPlanPeriodText,
  getTripDuration,
  getUpcomingRail,
} from '../planRow';

const withToday = (iso: string, run: () => void) => {
  jest.useFakeTimers().setSystemTime(new Date(iso));
  try {
    run();
  } finally {
    jest.useRealTimers();
  }
};

describe('getUpcomingRail', () => {
  it('오늘 출발이면 D-Day와 오늘을 준다', () => {
    withToday('2026-09-01T09:00:00', () => {
      expect(getUpcomingRail('2026-09-01')).toEqual({
        value: 'D-Day',
        caption: '오늘',
      });
    });
  });

  it('내일 출발은 숫자 대신 내일이라고 말한다', () => {
    withToday('2026-08-31T23:00:00', () => {
      expect(getUpcomingRail('2026-09-01')).toEqual({
        value: 'D-1',
        caption: '내일',
      });
    });
  });

  it('먼 일정은 출발 날짜를 캡션에 둔다', () => {
    withToday('2026-09-01T00:00:00', () => {
      expect(getUpcomingRail('2026-09-25')).toEqual({
        value: 'D-24',
        caption: '9월 25일',
      });
    });
  });

  it('날짜가 없으면 레일이 비지 않도록 미정으로 채운다', () => {
    expect(getUpcomingRail(undefined)).toEqual({
      value: 'D-Day',
      caption: '날짜 미정',
    });
  });
});

describe('getPastRail', () => {
  it('지난 일정은 D+가 아니라 출발 날짜를 세운다', () => {
    expect(getPastRail('2026-08-15')).toEqual({
      value: '8/15',
      caption: '2026',
    });
  });

  it('날짜가 없으면 대시로 자리를 지킨다', () => {
    expect(getPastRail(undefined)).toEqual({
      value: '—',
      caption: '날짜 없음',
    });
  });
});

describe('getTripDuration', () => {
  it('박과 일을 센다', () => {
    expect(getTripDuration('2026-09-01', '2026-09-03')).toBe('2박 3일');
  });

  it('끝 날짜가 없으면 당일치기로 본다', () => {
    expect(getTripDuration('2026-09-01')).toBe('당일치기');
  });

  it('시작 날짜가 없으면 아무 말도 하지 않는다', () => {
    expect(getTripDuration(undefined, '2026-09-03')).toBeUndefined();
  });
});

describe('getPlanPeriodText', () => {
  it('프로필 응답의 점 표기 날짜를 읽는다', () => {
    expect(getPlanPeriodText('2026.09.05', '2026.09.07')).toBe(
      '2026.09.05 ~ 2026.09.07',
    );
  });

  it('하이픈 표기도 그대로 읽는다', () => {
    expect(getPlanPeriodText('2026-09-05', '2026-09-07')).toBe(
      '2026.09.05 ~ 2026.09.07',
    );
  });

  it('같은 날이면 하나만 보여준다', () => {
    expect(getPlanPeriodText('2026.09.05', '2026.09.05')).toBe('2026.09.05');
  });

  it('끝 날짜가 없으면 시작 날짜만 보여준다', () => {
    expect(getPlanPeriodText('2026.09.05')).toBe('2026.09.05');
  });

  it('시작 날짜가 없으면 빈 문자열이라 앞에 점이 남지 않는다', () => {
    expect(getPlanPeriodText(undefined, '2026.09.07')).toBe('');
  });
});
