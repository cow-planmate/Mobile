
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
  updates: Partial<TimeTableDtoPayload>[];
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
  const updates: Partial<TimeTableDtoPayload>[] = [];
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
      updates.push({
        timeTableId: payload.timeTableId,
        planId,
        ...(formatDateLocal(current.date) !== payload.date ? { date: payload.date } : {}),
        ...(normalizeStart(current.startTime) !== payload.timeTableStartTime
          ? { timeTableStartTime: payload.timeTableStartTime } : {}),
        ...(normalizeEnd(current.endTime) !== payload.timeTableEndTime
          ? { timeTableEndTime: payload.timeTableEndTime } : {}),
      });
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
  originalDays: Day[] = currentDays,
): Day[] => {
  const key = (day: ScheduleEditDay) => hasServerId(day)
    ? String(day.timetableId) : formatDateLocal(day.date);
  const originalById = new Map(originalDays.map((day, index) => [key(day), { day, index }]));
  const merged = currentDays.flatMap(current => {
    const original = originalById.get(key(current));
    if (!original) return [current];
    const updated = updatedDays[original.index];
    if (!updated) return [];
    return [{
      ...current,
      date: formatDateLocal(updated.date) !== formatDateLocal(original.day.date) ? updated.date : current.date,
      startTime: normalizeStart(updated.startTime) !== normalizeStart(original.day.startTime)
        ? normalizeStart(updated.startTime) : current.startTime,
      endTime: normalizeEnd(updated.endTime) !== normalizeEnd(original.day.endTime)
        ? normalizeEnd(updated.endTime) : current.endTime,
    }];
  });
  updatedDays.slice(originalDays.length).forEach(updated => merged.push({
    date: updated.date,
    dayNumber: 0,
    startTime: normalizeStart(updated.startTime),
    endTime: normalizeEnd(updated.endTime),
    places: [],
  }));
  return merged.sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((day, index) => ({ ...day, dayNumber: index + 1 }));
};
