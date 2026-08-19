
export const DEFAULT_DAY_START = '09:00:00';
export const DEFAULT_DAY_END = '20:00:00';

export const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  // 여기서 NaN을 흘리면 이후 시간 계산이 전부 NaN이 되고 'NaN:NaN'이 그대로
  // 저장·동기화된다. 파싱되지 않는 값은 없는 값과 같게 취급한다.
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
};

export const timeToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value?: string | null): Date => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
};

// toLocaleTimeString은 엔진의 ICU 구현에 따라 'HH:mm'이 아닌 형식을 내줄 수
// 있고, 그 결과가 timeToMinutes로 들어가면 NaN이 되어 시간이 통째로 깨진다.
// 화면 표시가 아니라 계산에 쓰이는 값이므로 직접 조합한다.
export const dateToTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const MAX_MINUTES_IN_DAY = 23 * 60 + 45;

export const minutesToTime = (totalMinutes: number) => {
  const snappedMinutes = Math.min(
    Math.max(Math.round(totalMinutes / 15) * 15, 0),
    MAX_MINUTES_IN_DAY,
  );
  const hours = Math.floor(snappedMinutes / 60);
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

export interface ConflictableItem {
  id: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

export const resolveConflictsAndSort = <T extends ConflictableItem>(
  places: T[],
  anchorItemId: string | null = null,
  maxEndMinutesOverride?: number,
): T[] => {

  const MAX_END_MINUTES = Math.min(
    maxEndMinutesOverride ?? MAX_MINUTES_IN_DAY,
    MAX_MINUTES_IN_DAY,
  );

  const originals = new Map(places.map(p => [p.id, p]));
  const sortedPlaces = places.map(p => ({ ...p })).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const preserveUnchanged = (result: T[]): T[] =>
    result.map(p => {
      const original = originals.get(p.id);
      return original &&
        original.startTime === p.startTime &&
        original.endTime === p.endTime
        ? original
        : p;
    });

  const anchorIndex = anchorItemId
    ? sortedPlaces.findIndex(p => p.id === anchorItemId)
    : -1;

  if (anchorIndex === -1) {
    for (let i = 1; i < sortedPlaces.length; i++) {
      const prev = sortedPlaces[i - 1];
      const curr = sortedPlaces[i];
      const prevEndTime = timeToMinutes(prev.endTime);
      const currStartTime = timeToMinutes(curr.startTime);

      if (currStartTime < prevEndTime) {
        const currDuration =
          timeToMinutes(curr.endTime) - timeToMinutes(curr.startTime);
        const newStart = Math.min(prevEndTime, MAX_END_MINUTES - 15);
        const newEnd = Math.min(newStart + currDuration, MAX_END_MINUTES);
        curr.startTime = minutesToTime(newStart);
        curr.endTime = minutesToTime(Math.max(newEnd, newStart + 15));
      }
    }
    return preserveUnchanged(sortedPlaces);
  }

  const anchor = sortedPlaces[anchorIndex];
  const anchorStart = timeToMinutes(anchor.startTime);
  const anchorEnd = timeToMinutes(anchor.endTime);

  let lastEndTime = anchorEnd;
  for (let i = anchorIndex + 1; i < sortedPlaces.length; i++) {
    const curr = sortedPlaces[i];
    const currStart = timeToMinutes(curr.startTime);

    if (currStart < lastEndTime) {
      const currDuration = timeToMinutes(curr.endTime) - currStart;
      const newStart = Math.min(lastEndTime, MAX_END_MINUTES - 15);
      const newEnd = Math.min(newStart + currDuration, MAX_END_MINUTES);
      curr.startTime = minutesToTime(newStart);
      curr.endTime = minutesToTime(Math.max(newEnd, newStart + 15));
      lastEndTime = Math.max(newEnd, newStart + 15);
    } else {
      lastEndTime = timeToMinutes(curr.endTime);
    }
  }

  let lastStartTime = anchorStart;
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const curr = sortedPlaces[i];
    const currEnd = timeToMinutes(curr.endTime);

    if (currEnd > lastStartTime) {
      const currDuration = currEnd - timeToMinutes(curr.startTime);

      const newStart = Math.max(lastStartTime - currDuration, 0);
      const newEnd = Math.max(lastStartTime, newStart + 15);
      curr.startTime = minutesToTime(newStart);
      curr.endTime = minutesToTime(newEnd);
      lastStartTime = timeToMinutes(curr.startTime);
    } else {
      lastStartTime = timeToMinutes(curr.startTime);
    }
  }

  return preserveUnchanged(sortedPlaces);
};
