import {
  TEMP_PLACE_ID_PREFIX,
  buildTimeTableDto,
  createTempPlaceId,
  isTempPlaceId,
  resolveBlockId,
  toLocalTime,
} from '../planSyncPayload';
import { DEFAULT_DAY_END, DEFAULT_DAY_START } from '../timeUtils';

describe('resolveBlockId', () => {
  it('서버가 준 blockId 문자열은 숫자로 바꾼다', () => {
    expect(resolveBlockId('12')).toBe(12);
  });

  it('임시 ID는 서버 blockId가 아니다', () => {

    expect(resolveBlockId(createTempPlaceId())).toBeNull();
    expect(resolveBlockId(`${TEMP_PLACE_ID_PREFIX}1700000000_0.5`)).toBeNull();
  });

  it('정수가 아니거나 0 이하면 null', () => {
    expect(resolveBlockId('12.5')).toBeNull();
    expect(resolveBlockId('0')).toBeNull();
    expect(resolveBlockId('-3')).toBeNull();
    expect(resolveBlockId('abc')).toBeNull();
  });

  it('빈 값이면 null', () => {
    expect(resolveBlockId(null)).toBeNull();
    expect(resolveBlockId(undefined)).toBeNull();
    expect(resolveBlockId('')).toBeNull();
  });
});

describe('isTempPlaceId', () => {
  it('createTempPlaceId가 만든 값은 임시 ID로 판별된다', () => {
    expect(isTempPlaceId(createTempPlaceId())).toBe(true);
  });

  it('서버 ID와 빈 값은 임시 ID가 아니다', () => {
    expect(isTempPlaceId('12')).toBe(false);
    expect(isTempPlaceId(null)).toBe(false);
    expect(isTempPlaceId(undefined)).toBe(false);
  });

  it('연속 호출이 같은 ID를 만들지 않는다', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createTempPlaceId()));
    expect(ids.size).toBe(50);
  });
});

describe('toLocalTime', () => {
  it("'HH:mm'에는 초를 붙인다", () => {
    expect(toLocalTime('09:30')).toBe('09:30:00');
  });

  it("이미 'HH:mm:ss'면 그대로 둔다", () => {
    expect(toLocalTime('09:30:00')).toBe('09:30:00');
  });

  it('빈 값이면 undefined', () => {
    expect(toLocalTime('')).toBeUndefined();
    expect(toLocalTime(null)).toBeUndefined();
    expect(toLocalTime(undefined)).toBeUndefined();
  });
});

describe('buildTimeTableDto', () => {
  const planId = '0199a1b2-c3d4-7e5f-8901-234567890abc';

  it('sharedsync TimeTableDto와 같은 키로 만든다', () => {
    expect(
      buildTimeTableDto({
        timetableId: 7,
        dateString: '2026-08-12',
        startTime: '08:00',
        endTime: '22:00',
        planId,
      }),
    ).toEqual({
      timeTableId: 7,
      date: '2026-08-12',
      timeTableStartTime: '08:00:00',
      timeTableEndTime: '22:00:00',
      planId,
    });
  });

  it('서버 ID가 없으면 null로 보낸다(생성 요청)', () => {
    const payload = buildTimeTableDto({
      dateString: '2026-08-12',
      startTime: '08:00',
      endTime: '22:00',
      planId,
    });

    expect(payload.timeTableId).toBeNull();
  });

  it('시각이 비면 기본 운영시간으로 채운다', () => {
    const payload = buildTimeTableDto({
      timetableId: 1,
      dateString: '2026-08-12',
      planId,
    });

    expect(payload.timeTableStartTime).toBe(DEFAULT_DAY_START);
    expect(payload.timeTableEndTime).toBe(DEFAULT_DAY_END);
  });

  it('planId는 그대로 실어 보낸다', () => {

    expect(
      buildTimeTableDto({ dateString: '2026-08-12', planId }).planId,
    ).toBe(planId);
  });
});
