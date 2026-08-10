/**
 * 일정 변경(일차별 날짜·운영시간) 확정 시의 timetable 동기화 계산.
 *
 * 일차 매칭은 날짜가 아니라 인덱스로 한다. 날짜로 매칭하면 "1일차를 8/10에서 8/15로
 * 옮기기"가 8/10 삭제 + 8/15 생성으로 해석돼 그날의 블록이 통째로 버려진다. 게다가
 * 서버는 캐시에서 지운 타임테이블을 DB에서 지우지 못해(plan→timetable 고아 정리가
 * 동작하지 않음) 재진입 시 옛 날짜가 되살아난다. 날짜는 TimeTableDto의 일반 필드라
 * update 한 번으로 바꿀 수 있으므로 생성·삭제 자체를 만들지 않는 것이 맞다.
 *
 * ScheduleEditModal은 일차 순서를 유지하고 끝에서만 추가·삭제하므로 인덱스가 곧
 * 같은 일차를 가리킨다.
 */

import type { Day } from '../contexts/ItineraryContext';
import {
  formatDateLocal,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from './timeUtils';
import {
  buildTimeTableDto,
  toLocalTime,
  TimeTableDtoPayload,
} from './planSyncPayload';

export interface ScheduleEditDay {
  timetableId?: number | null;
  date: Date;
  startTime?: string;
  endTime?: string;
}

export interface ScheduleEditSync {
  creates: TimeTableDtoPayload[];
  updates: TimeTableDtoPayload[];
  deletes: TimeTableDtoPayload[];
}

const normalizeStart = (time?: string) => toLocalTime(time) || DEFAULT_DAY_START;
const normalizeEnd = (time?: string) => toLocalTime(time) || DEFAULT_DAY_END;

const hasServerId = (day: ScheduleEditDay) =>
  day.timetableId !== undefined && day.timetableId !== null;

const isSameSchedule = (a: ScheduleEditDay, b: ScheduleEditDay) =>
  formatDateLocal(a.date) === formatDateLocal(b.date) &&
  normalizeStart(a.startTime) === normalizeStart(b.startTime) &&
  normalizeEnd(a.endTime) === normalizeEnd(b.endTime);

/**
 * 일차 날짜가 오름차순이며 중복이 없는지 검사합니다.
 *
 * 같은 날짜가 두 번 나오면 서로 다른 두 일차가 같은 타임테이블을 가리키게 되어
 * 한쪽 블록 편집이 다른 쪽을 덮어씁니다.
 *
 * @returns 앞 일차보다 같거나 이른 첫 일차의 인덱스. 문제가 없으면 null.
 */
export const findInvalidDateOrder = (
  days: { date: Date }[],
): number | null => {
  for (let i = 1; i < days.length; i++) {
    if (formatDateLocal(days[i].date) <= formatDateLocal(days[i - 1].date)) {
      return i;
    }
  }
  return null;
};

/**
 * 현재 일차 목록과 변경된 일차 목록을 인덱스로 대조해 전송할 페이로드를 만듭니다.
 *
 * @param currentDays 화면이 들고 있는 일차 목록
 * @param updatedDays 일정 변경 모달이 확정한 일차 목록
 * @param planId 대상 일정 ID
 */
export const buildScheduleEditSync = (
  currentDays: ScheduleEditDay[],
  updatedDays: ScheduleEditDay[],
  planId: string,
): ScheduleEditSync => {
  const creates: TimeTableDtoPayload[] = [];
  const updates: TimeTableDtoPayload[] = [];
  const deletes: TimeTableDtoPayload[] = [];

  const shared = Math.min(currentDays.length, updatedDays.length);

  for (let i = 0; i < shared; i++) {
    const current = currentDays[i];
    const updated = updatedDays[i];
    if (isSameSchedule(current, updated)) continue;

    const payload = buildTimeTableDto({
      timetableId: current.timetableId,
      dateString: formatDateLocal(updated.date),
      startTime: updated.startTime,
      endTime: updated.endTime,
      planId,
    });

    // 서버 ID가 없는 일차는 아직 DB/캐시에 없다. ID 없는 update는 서버에서
    // 예외로 폐기되므로 생성으로 돌린다.
    if (hasServerId(current)) {
      updates.push(payload);
    } else {
      creates.push({ ...payload, timeTableId: null });
    }
  }

  for (let i = shared; i < updatedDays.length; i++) {
    const added = updatedDays[i];
    creates.push(
      buildTimeTableDto({
        dateString: formatDateLocal(added.date),
        startTime: added.startTime,
        endTime: added.endTime,
        planId,
      }),
    );
  }

  for (let i = shared; i < currentDays.length; i++) {
    const removed = currentDays[i];
    // ID가 없으면 서버에 지울 대상 자체가 없다.
    if (!hasServerId(removed)) continue;
    deletes.push(
      buildTimeTableDto({
        timetableId: removed.timetableId,
        dateString: formatDateLocal(removed.date),
        startTime: removed.startTime,
        endTime: removed.endTime,
        planId,
      }),
    );
  }

  return { creates, updates, deletes };
};

/**
 * 변경된 일차 목록을 로컬 상태에 반영합니다.
 *
 * 인덱스로 대조해 기존 일차의 timetableId와 장소를 그대로 이어받습니다.
 * 날짜로 대조하면 날짜를 옮긴 일차가 "새 일차"로 판정돼 장소가 화면에서 사라집니다.
 */
export const mergeScheduleEditDays = (
  currentDays: Day[],
  updatedDays: ScheduleEditDay[],
): Day[] =>
  updatedDays.map((updated, index) => {
    const current = currentDays[index];
    if (current) {
      return {
        ...current,
        date: updated.date,
        startTime: normalizeStart(updated.startTime ?? current.startTime),
        endTime: normalizeEnd(updated.endTime ?? current.endTime),
        dayNumber: index + 1,
      };
    }
    return {
      date: updated.date,
      dayNumber: index + 1,
      startTime: normalizeStart(updated.startTime),
      endTime: normalizeEnd(updated.endTime),
      places: [],
    };
  });
