import { resolveConflictsAndSort } from '../src/utils/timeUtils';

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
});
