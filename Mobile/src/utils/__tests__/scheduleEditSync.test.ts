import {
  buildScheduleEditSync,
  findInvalidDateOrder,
  mergeScheduleEditDays,
  ScheduleEditDay,
} from '../scheduleEditSync';

const PLAN_ID = '11111111-2222-3333-4444-555555555555';

const day = (
  timetableId: number | null,
  year: number,
  month: number,
  date: number,
  startTime = '09:00:00',
  endTime = '20:00:00',
): ScheduleEditDay => ({
  timetableId,
  date: new Date(year, month - 1, date),
  startTime,
  endTime,
});

describe('buildScheduleEditSync', () => {
  it('날짜만 바뀌면 update만 보내고 생성·삭제는 만들지 않는다', () => {
    const current = [day(100, 2026, 8, 10), day(101, 2026, 8, 11)];
    const updated = [day(null, 2026, 8, 15), day(null, 2026, 8, 16)];

    const { creates, updates, deletes } = buildScheduleEditSync(
      current,
      updated,
      PLAN_ID,
    );

    expect(creates).toHaveLength(0);
    expect(deletes).toHaveLength(0);
    expect(updates).toEqual([
      {
        timeTableId: 100,
        date: '2026-08-15',
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
        planId: PLAN_ID,
      },
      {
        timeTableId: 101,
        date: '2026-08-16',
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
        planId: PLAN_ID,
      },
    ]);
  });

  it('일수가 늘면 늘어난 일차만 create로 보낸다', () => {
    const current = [day(100, 2026, 8, 10)];
    const updated = [day(null, 2026, 8, 10), day(null, 2026, 8, 11)];

    const { creates, updates, deletes } = buildScheduleEditSync(
      current,
      updated,
      PLAN_ID,
    );

    expect(updates).toHaveLength(0);
    expect(deletes).toHaveLength(0);
    expect(creates).toEqual([
      {
        timeTableId: null,
        date: '2026-08-11',
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
        planId: PLAN_ID,
      },
    ]);
  });

  it('일수가 줄면 줄어든 일차만 delete로 보낸다', () => {
    const current = [day(100, 2026, 8, 10), day(101, 2026, 8, 11)];
    const updated = [day(null, 2026, 8, 10)];

    const { creates, updates, deletes } = buildScheduleEditSync(
      current,
      updated,
      PLAN_ID,
    );

    expect(creates).toHaveLength(0);
    expect(updates).toHaveLength(0);
    expect(deletes).toEqual([
      {
        timeTableId: 101,
        date: '2026-08-11',
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
        planId: PLAN_ID,
      },
    ]);
  });

  it('운영시간만 바뀐 일차만 update로 보낸다', () => {
    const current = [
      day(100, 2026, 8, 10, '09:00:00', '20:00:00'),
      day(101, 2026, 8, 11, '09:00:00', '20:00:00'),
    ];
    const updated = [
      day(null, 2026, 8, 10, '10:00', '22:00'),
      day(null, 2026, 8, 11, '09:00:00', '20:00:00'),
    ];

    const { creates, updates, deletes } = buildScheduleEditSync(
      current,
      updated,
      PLAN_ID,
    );

    expect(creates).toHaveLength(0);
    expect(deletes).toHaveLength(0);
    expect(updates).toEqual([
      {
        timeTableId: 100,
        date: '2026-08-10',
        timeTableStartTime: '10:00:00',
        timeTableEndTime: '22:00:00',
        planId: PLAN_ID,
      },
    ]);
  });

  it('서버 ID가 없는 일차의 변경은 update가 아니라 create로 돌린다', () => {
    const current = [day(null, 2026, 8, 10)];
    const updated = [day(null, 2026, 8, 12)];

    const { creates, updates, deletes } = buildScheduleEditSync(
      current,
      updated,
      PLAN_ID,
    );

    expect(updates).toHaveLength(0);
    expect(deletes).toHaveLength(0);
    expect(creates).toEqual([
      {
        timeTableId: null,
        date: '2026-08-12',
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
        planId: PLAN_ID,
      },
    ]);
  });

  it('바뀐 것이 없으면 아무것도 보내지 않는다', () => {
    const current = [day(100, 2026, 8, 10), day(101, 2026, 8, 11)];
    const updated = [day(null, 2026, 8, 10), day(null, 2026, 8, 11)];

    expect(buildScheduleEditSync(current, updated, PLAN_ID)).toEqual({
      creates: [],
      updates: [],
      deletes: [],
    });
  });
});

describe('findInvalidDateOrder', () => {
  it('오름차순이면 null을 반환한다', () => {
    expect(
      findInvalidDateOrder([
        day(null, 2026, 8, 10),
        day(null, 2026, 8, 11),
        day(null, 2026, 8, 13),
      ]),
    ).toBeNull();
  });

  it('중복 날짜가 있으면 해당 인덱스를 반환한다', () => {
    expect(
      findInvalidDateOrder([
        day(null, 2026, 8, 10),
        day(null, 2026, 8, 10),
        day(null, 2026, 8, 11),
      ]),
    ).toBe(1);
  });

  it('앞 일차보다 이른 날짜가 있으면 해당 인덱스를 반환한다', () => {
    expect(
      findInvalidDateOrder([
        day(null, 2026, 8, 10),
        day(null, 2026, 8, 12),
        day(null, 2026, 8, 11),
      ]),
    ).toBe(2);
  });
});

describe('mergeScheduleEditDays', () => {
  const place = (id: string) =>
    ({ id, name: '장소', startTime: '10:00', endTime: '11:00' } as any);

  it('날짜를 옮겨도 timetableId와 장소를 유지한다', () => {
    const current = [
      {
        timetableId: 100,
        date: new Date(2026, 7, 10),
        dayNumber: 1,
        startTime: '09:00:00',
        endTime: '20:00:00',
        places: [place('1')],
      },
    ];

    const merged = mergeScheduleEditDays(current, [day(null, 2026, 8, 15)]);

    expect(merged).toHaveLength(1);
    expect(merged[0].timetableId).toBe(100);
    expect(merged[0].places).toEqual([place('1')]);
    expect(merged[0].date.getDate()).toBe(15);
    expect(merged[0].dayNumber).toBe(1);
  });

  it('늘어난 일차는 빈 장소 목록으로 만든다', () => {
    const merged = mergeScheduleEditDays(
      [],
      [day(null, 2026, 8, 10), day(null, 2026, 8, 11, '10:00', '21:00')],
    );

    expect(merged).toHaveLength(2);
    expect(merged[1]).toMatchObject({
      dayNumber: 2,
      startTime: '10:00:00',
      endTime: '21:00:00',
      places: [],
    });
    expect(merged[1].timetableId).toBeUndefined();
  });

  it('줄어든 일차는 결과에서 빠진다', () => {
    const current = [
      {
        timetableId: 100,
        date: new Date(2026, 7, 10),
        dayNumber: 1,
        places: [],
      },
      {
        timetableId: 101,
        date: new Date(2026, 7, 11),
        dayNumber: 2,
        places: [],
      },
    ];

    expect(mergeScheduleEditDays(current, [day(null, 2026, 8, 10)])).toHaveLength(
      1,
    );
  });
});
