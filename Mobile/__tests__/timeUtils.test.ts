import {
  resolveConflictsAndSort,
  minutesToTime,
  timeToMinutes,
  formatDateLocal,
} from '../src/utils/timeUtils';

describe('resolveConflictsAndSort', () => {
  it('should sort places by start time when there are no overlaps', () => {
    const places = [
      { id: '2', startTime: '11:00', endTime: '12:00' },
      { id: '1', startTime: '09:00', endTime: '10:00' },
    ];
    
    const result = resolveConflictsAndSort(places);
    expect(result.map(p => p.id)).toEqual(['1', '2']);
    expect(result[0].startTime).toBe('09:00');
    expect(result[1].startTime).toBe('11:00');
  });

  it('should push subsequent items forward when overlaps occur (no anchor)', () => {
    const places = [
      { id: '1', startTime: '09:00', endTime: '10:00' },
      { id: '2', startTime: '09:30', endTime: '11:00' }, // overlaps with 1
    ];

    const result = resolveConflictsAndSort(places);
    expect(result[0].id).toBe('1');
    expect(result[0].startTime).toBe('09:00');
    expect(result[0].endTime).toBe('10:00');
    
    expect(result[1].id).toBe('2');
    expect(result[1].startTime).toBe('10:00'); // pushed to start after 1 ends
    expect(result[1].endTime).toBe('11:30');   // duration preserved (1.5 hours)
  });

  it('should keep anchor item fixed and push others backward/forward', () => {
    const places = [
      { id: '1', startTime: '09:00', endTime: '10:00' },
      { id: '2', startTime: '09:30', endTime: '10:30' }, // anchor is edited to start at 09:30
      { id: '3', startTime: '10:00', endTime: '11:00' },
    ];

    // Anchor is '2'
    const result = resolveConflictsAndSort(places, '2');

    // Anchor '2' must remain fixed at 09:30 - 10:30
    const anchor = result.find(p => p.id === '2')!;
    expect(anchor.startTime).toBe('09:30');
    expect(anchor.endTime).toBe('10:30');

    // Place '3' (starts at 10:00, which overlaps with anchor end 10:30) must be pushed forward
    const after = result.find(p => p.id === '3')!;
    expect(after.startTime).toBe('10:30');
    expect(after.endTime).toBe('11:30');

    // Place '1' (ends at 10:00, which overlaps with anchor start 09:30) must be pushed backward
    const before = result.find(p => p.id === '1')!;
    expect(before.endTime).toBe('09:30');
    expect(before.startTime).toBe('08:30');
  });

  it('역방향으로 밀어낼 때 0시 이전으로 넘어가지 않는다', () => {
    // anchor '3'을 01:00으로 옮기면 앞선 블록들이 0시 밑으로 밀릴 수 있다.
    const places = [
      { id: '1', startTime: '00:00', endTime: '06:00' },
      { id: '2', startTime: '00:30', endTime: '02:00' },
      { id: '3', startTime: '01:00', endTime: '02:00' },
    ];

    const result = resolveConflictsAndSort(places, '3');

    result.forEach(p => {
      expect(p.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(p.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(timeToMinutes(p.startTime)).toBeGreaterThanOrEqual(0);
      expect(timeToMinutes(p.endTime)).toBeGreaterThanOrEqual(0);
    });
  });

  it('하루 종료 상한이 24:00으로 들어와도 23:45로 잘라낸다', () => {
    const places = [
      { id: '1', startTime: '22:00', endTime: '23:00' },
      { id: '2', startTime: '22:30', endTime: '23:59' },
    ];

    const result = resolveConflictsAndSort(places, '1', 24 * 60);

    const pushed = result.find(p => p.id === '2')!;
    expect(timeToMinutes(pushed.endTime)).toBeLessThanOrEqual(23 * 60 + 45);
  });
});

describe('minutesToTime', () => {
  it('음수 입력을 00:00으로 클램프한다', () => {
    // 클램프가 없으면 "-1:-30" 같은 값이 나와 서버 LocalTime 파싱이 실패한다.
    expect(minutesToTime(-30)).toBe('00:00');
    expect(minutesToTime(-1)).toBe('00:00');
  });

  it('24:00 이상을 23:45로 클램프한다', () => {
    expect(minutesToTime(1440)).toBe('23:45');
    expect(minutesToTime(2000)).toBe('23:45');
  });

  it('정상 범위는 15분 단위로 스냅한다', () => {
    expect(minutesToTime(540)).toBe('09:00');
    expect(minutesToTime(547)).toBe('09:00');
    expect(minutesToTime(553)).toBe('09:15');
  });

  it('출력은 항상 HH:mm 형식이다', () => {
    [-100, 0, 61, 719, 1439, 1440, 5000].forEach(m => {
      expect(minutesToTime(m)).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});

describe('formatDateLocal', () => {
  it('UTC가 아닌 로컬 기준으로 날짜를 만든다', () => {
    // KST 자정은 toISOString()에서 전날로 밀린다.
    expect(formatDateLocal(new Date(2026, 7, 1, 0, 0, 0))).toBe('2026-08-01');
    expect(formatDateLocal(new Date(2026, 0, 5, 23, 59, 59))).toBe('2026-01-05');
  });
});
