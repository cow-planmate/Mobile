import { buildTimeTableDto, toLocalTime } from '../src/utils/planSyncPayload';

describe('buildTimeTableDto', () => {
  const planId = '0199a1b2-c3d4-7e5f-8901-234567890abc';

  it('서버 TimeTableDto와 동일한 키만 생성한다', () => {
    const dto = buildTimeTableDto({
      dateString: '2026-08-01',
      startTime: '09:00:00',
      endTime: '20:00:00',
      planId,
    });

    expect(Object.keys(dto).sort()).toEqual(
      [
        'date',
        'planId',
        'timeTableEndTime',
        'timeTableId',
        'timeTableStartTime',
      ].sort(),
    );
  });

  it('부모 인덱스 등록에 필요한 planId를 반드시 포함한다', () => {
    const dto = buildTimeTableDto({ dateString: '2026-08-01', planId });
    expect(dto.planId).toBe(planId);
  });

  it('신규 생성 시 timeTableId는 null이다 (0을 보내지 않는다)', () => {
    const dto = buildTimeTableDto({ dateString: '2026-08-01', planId });
    expect(dto.timeTableId).toBeNull();
  });

  it('기존 timetable 삭제 시 timeTableId를 그대로 싣는다', () => {
    const dto = buildTimeTableDto({
      timetableId: 512,
      dateString: '2026-08-01',
      planId,
    });
    expect(dto.timeTableId).toBe(512);
  });

  it('시각을 LocalTime 호환 HH:mm:ss로 정규화한다', () => {
    const dto = buildTimeTableDto({
      dateString: '2026-08-01',
      startTime: '08:30',
      endTime: '21:15',
      planId,
    });
    expect(dto.timeTableStartTime).toBe('08:30:00');
    expect(dto.timeTableEndTime).toBe('21:15:00');
  });

  it('시각 누락 시 기본 운영시간을 채운다', () => {
    const dto = buildTimeTableDto({ dateString: '2026-08-01', planId });
    expect(dto.timeTableStartTime).toBe('09:00:00');
    expect(dto.timeTableEndTime).toBe('20:00:00');
  });

  it('구 페이로드의 잘못된 키(timetableId/startTime/endTime)를 만들지 않는다', () => {
    const dto = buildTimeTableDto({
      timetableId: 1,
      dateString: '2026-08-01',
      startTime: '09:00:00',
      planId,
    }) as Record<string, unknown>;

    expect(dto.timetableId).toBeUndefined();
    expect(dto.startTime).toBeUndefined();
    expect(dto.endTime).toBeUndefined();
  });
});

describe('운영시간 update 페이로드 (N-1)', () => {
  const planId = '0199a1b2-c3d4-7e5f-8901-234567890abc';

  it('기존 timetable의 시간 변경도 동일한 DTO 키로 만들어진다', () => {
    const dto = buildTimeTableDto({
      timetableId: 77,
      dateString: '2026-08-01',
      startTime: '08:00:00',
      endTime: '22:00:00',
      planId,
    });

    expect(dto).toEqual({
      timeTableId: 77,
      date: '2026-08-01',
      timeTableStartTime: '08:00:00',
      timeTableEndTime: '22:00:00',
      planId,
    });
  });

  it('사용자가 지정한 시간이 기본값으로 덮이지 않는다', () => {
    const dto = buildTimeTableDto({
      timetableId: 77,
      dateString: '2026-08-01',
      startTime: '06:30',
      endTime: '23:00',
      planId,
    });

    expect(dto.timeTableStartTime).toBe('06:30:00');
    expect(dto.timeTableEndTime).toBe('23:00:00');
  });
});

describe('toLocalTime', () => {
  it('HH:mm은 초를 붙이고 HH:mm:ss는 그대로 둔다', () => {
    expect(toLocalTime('09:00')).toBe('09:00:00');
    expect(toLocalTime('09:00:00')).toBe('09:00:00');
  });

  it('빈 값은 undefined를 반환한다', () => {
    expect(toLocalTime(undefined)).toBeUndefined();
    expect(toLocalTime('')).toBeUndefined();
  });
});
