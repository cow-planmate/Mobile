/**
 * 'HH:mm' 포맷의 시간 문자열을 분(minute) 단위 숫자로 변환합니다.
 */
export const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 'HH:mm' 시간 문자열을 오늘 날짜의 Date 객체로 변환합니다.
 */
export const timeToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Date 객체에서 'HH:mm' 형태의 24시간제 시간 문자열을 추출합니다.
 */
export const dateToTime = (date: Date) => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 분 단위 숫자를 15분 스냅 단위의 'HH:mm' 시간 문자열로 변환합니다.
 */
export const minutesToTime = (totalMinutes: number) => {
  const snappedMinutes = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(snappedMinutes / 60) % 24;
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

/** 시간 충돌 해결이 가능한 일정 장소 아이템 인터페이스 */
export interface ConflictableItem {
  id: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

/**
 * 장소 블록 간 시간 중첩 충돌을 해결하고 순차적으로 정렬합니다.
 * @param places 장소 목록
 * @param anchorItemId 시간 조절 기준이 되는 고정 아이템 ID
 * @param maxEndMinutesOverride 하루 최대 종료 시간(분 단위, 기본값 23:45)
 * @returns 시간 충돌이 정돈된 장소 목록
 */
export const resolveConflictsAndSort = <T extends ConflictableItem>(
  places: T[],
  anchorItemId: string | null = null,
  maxEndMinutesOverride?: number,
): T[] => {
  const MAX_END_MINUTES = maxEndMinutesOverride ?? 23 * 60 + 45; // 하루 최대 종료 시간 제한 (23:45)

  // 원본 객체 직접 변경 방지를 위한 딥 카피 및 시작 시간 기준 정렬
  const sortedPlaces = places.map(p => ({ ...p })).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

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
    return sortedPlaces;
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
      curr.endTime = minutesToTime(lastStartTime);
      curr.startTime = minutesToTime(lastStartTime - currDuration);
      lastStartTime = timeToMinutes(curr.startTime);
    } else {
      lastStartTime = timeToMinutes(curr.startTime);
    }
  }

  return sortedPlaces;
};


