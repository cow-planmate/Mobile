import { applyTimetableBroadcast } from '../timetableBroadcast';
import type { Day } from '../../contexts/ItineraryContext';

const day = (
  timetableId: number | undefined,
  year: number,
  month: number,
  date: number,
  startTime = '09:00:00',
  endTime = '20:00:00',
  places: Day['places'] = [],
): Day => ({
  timetableId,
  date: new Date(year, month - 1, date),
  dayNumber: 1,
  startTime,
  endTime,
  places,
});

const place = (id: string) =>
  ({ id, name: '장소', startTime: '10:00', endTime: '11:00' } as any);

describe('applyTimetableBroadcast', () => {
  it('timetableId로 매칭해 날짜만 update하고 장소를 보존한다', () => {
    const current = [day(100, 2026, 8, 10, '09:00:00', '20:00:00', [place('1')])];

    const { days, changed } = applyTimetableBroadcast(current, 'update', [
      { timeTableId: 100, date: '2026-08-15', timeTableStartTime: '09:00:00', timeTableEndTime: '20:00:00' },
    ]);

    expect(changed).toBe(true);
    expect(days).toHaveLength(1);
    expect(days[0].timetableId).toBe(100);
    expect(days[0].date.getDate()).toBe(15);
    expect(days[0].places).toEqual([place('1')]);
  });

  it('날짜만으로 매칭하지 않아 다른 일차와 병합되지 않는다', () => {

    const current = [
      day(100, 2026, 8, 10, '09:00:00', '20:00:00', [place('1')]),
      day(101, 2026, 8, 16, '09:00:00', '20:00:00', [place('2')]),
    ];

    const { days } = applyTimetableBroadcast(current, 'update', [
      { timeTableId: 100, date: '2026-08-16', timeTableStartTime: '09:00:00', timeTableEndTime: '20:00:00' },
    ]);

    expect(days).toHaveLength(2);
    const updated = days.find(d => d.timetableId === 100)!;
    const untouched = days.find(d => d.timetableId === 101)!;
    expect(updated.places).toEqual([place('1')]);
    expect(untouched.places).toEqual([place('2')]);
  });

  it('서버 ID가 없는 신규 일차는 날짜로 매칭해 ID를 확정한다', () => {
    const current = [day(undefined, 2026, 8, 10)];

    const { days } = applyTimetableBroadcast(current, 'create', [
      { timeTableId: 200, date: '2026-08-10', timeTableStartTime: '09:00:00', timeTableEndTime: '20:00:00' },
    ]);

    expect(days[0].timetableId).toBe(200);
  });

  it('매칭되는 일차가 없으면 새 일차를 추가한다', () => {
    const current = [day(100, 2026, 8, 10)];

    const { days, changed } = applyTimetableBroadcast(current, 'create', [
      { timeTableId: 101, date: '2026-08-11', timeTableStartTime: '09:00:00', timeTableEndTime: '20:00:00' },
    ]);

    expect(changed).toBe(true);
    expect(days).toHaveLength(2);
    expect(days.map(d => d.dayNumber)).toEqual([1, 2]);
  });

  it('delete는 timetableId로 매칭해 해당 일차를 제거한다', () => {
    const current = [day(100, 2026, 8, 10), day(101, 2026, 8, 11)];

    const { days, changed } = applyTimetableBroadcast(current, 'delete', [
      { timeTableId: 100 },
    ]);

    expect(changed).toBe(true);
    expect(days).toHaveLength(1);
    expect(days[0].timetableId).toBe(101);
  });

  it('운영시간만 바뀌면 update로 반영한다', () => {
    const current = [day(100, 2026, 8, 10, '09:00:00', '20:00:00')];

    const { days, changed } = applyTimetableBroadcast(current, 'update', [
      { timeTableId: 100, date: '2026-08-10', timeTableStartTime: '10:00:00', timeTableEndTime: '22:00:00' },
    ]);

    expect(changed).toBe(true);
    expect(days[0].startTime).toBe('10:00:00');
    expect(days[0].endTime).toBe('22:00:00');
  });

  it('바뀐 것이 없으면 원본 배열을 그대로 반환한다', () => {
    const current = [day(100, 2026, 8, 10, '09:00:00', '20:00:00')];

    const { days, changed } = applyTimetableBroadcast(current, 'update', [
      { timeTableId: 100, date: '2026-08-10', timeTableStartTime: '09:00:00', timeTableEndTime: '20:00:00' },
    ]);

    expect(changed).toBe(false);
    expect(days).toBe(current);
  });
});
