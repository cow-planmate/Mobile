
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
