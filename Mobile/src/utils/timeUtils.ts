/**
 * 하루 운영시간 기본값. 타임라인 그리드 범위와 충돌 해결 상한이
 * 같은 값을 써야 그리드 밖으로 밀려나 보이지 않는 블록이 생기지 않는다.
 */
export const DEFAULT_DAY_START = '09:00:00';
export const DEFAULT_DAY_END = '20:00:00';

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
 * Date 객체를 로컬 타임존 기준 'YYYY-MM-DD' 문자열로 변환합니다.
 * toISOString()은 UTC로 변환되어 KST 자정 기준 하루가 밀리므로 사용하지 않습니다.
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 'YYYY-MM-DD' 문자열을 로컬 타임존 기준 Date로 파싱합니다.
 * new Date('2026-08-10')은 UTC 자정으로 해석되어 UTC보다 이른 타임존에서는
 * 하루가 밀립니다. formatDateLocal과 왕복이 어긋나지 않도록 로컬로 만듭니다.
 */
export const parseLocalDate = (value?: string | null): Date => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
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

/** 하루 안에서 표현 가능한 최대 분 (23:45) */
export const MAX_MINUTES_IN_DAY = 23 * 60 + 45;

/**
 * 분 단위 숫자를 15분 스냅 단위의 'HH:mm' 시간 문자열로 변환합니다.
 * 하루 범위를 벗어난 입력은 클램프합니다. 음수나 1440 이상을 % 24로 접으면
 * '-1:-30' / '00:00' 같은 값이 만들어져 서버 LocalTime 파싱이 실패합니다.
 */
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
  // 하루 최대 종료 시간 제한. override가 24:00(1440)으로 들어와도 표현 가능 범위로 잘라낸다.
  const MAX_END_MINUTES = Math.min(
    maxEndMinutesOverride ?? MAX_MINUTES_IN_DAY,
    MAX_MINUTES_IN_DAY,
  );

  // 원본 객체 직접 변경 방지를 위한 얕은 복사 및 시작 시간 기준 정렬
  const originals = new Map(places.map(p => [p.id, p]));
  const sortedPlaces = places.map(p => ({ ...p })).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  /**
   * 시간이 그대로인 항목은 원본 참조를 되돌려 준다.
   *
   * 항상 새 객체를 반환하면 한 블록만 옮겨도 그날의 모든 블록이 새 참조가 되어
   * 타임라인 아이템(React.memo)이 전부 다시 렌더된다. 드래그 중에는 이 비용이
   * 프레임에 그대로 드러난다.
   */
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
      // 0시 이전으로 밀리지 않도록 하한을 두고, 하한에 걸리면 최소 길이(15분)를 보장한다.
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


