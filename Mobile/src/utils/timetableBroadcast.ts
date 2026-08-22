
import type { Day } from '../contexts/ItineraryContext';
import {
  formatDateLocal,
  parseLocalDate,
  normalizeTime,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from './timeUtils';

export interface TimetableBroadcastResult {
  days: Day[];
  changed: boolean;
}

export const applyTimetableBroadcast = (
  currentDays: Day[],
  action: string,
  dataList: any[],
): TimetableBroadcastResult => {
  const nextDays = [...currentDays];
  let changed = false;

  dataList.forEach((respVO: any) => {
    const timetableId = respVO.timeTableId ?? respVO.timetableId;
    const hasId = timetableId !== undefined && timetableId !== null;
    const dateStr = respVO.date ? String(respVO.date).split('T')[0] : null;

    if (action === 'delete') {
      if (!hasId) return;
      const idx = nextDays.findIndex(
        d => String(d.timetableId) === String(timetableId),
      );
      if (idx !== -1) {
        nextDays.splice(idx, 1);
        changed = true;
      }
      return;
    }

    if (!hasId && !dateStr) return;

    let idx = hasId
      ? nextDays.findIndex(d => String(d.timetableId) === String(timetableId))
      : -1;

    if (idx === -1 && dateStr) {
      idx = nextDays.findIndex(d => formatDateLocal(d.date) === dateStr);
    }

    if (idx !== -1) {
      const existing = nextDays[idx];
      const nextStartTime = respVO.timeTableStartTime ?? existing.startTime;
      const nextEndTime = respVO.timeTableEndTime ?? existing.endTime;

      const dateChanged = !!dateStr && formatDateLocal(existing.date) !== dateStr;
      const startChanged =
        normalizeTime(existing.startTime) !== normalizeTime(nextStartTime);
      const endChanged =
        normalizeTime(existing.endTime) !== normalizeTime(nextEndTime);
      const idChanged =
        hasId && String(existing.timetableId) !== String(timetableId);

      if (dateChanged || startChanged || endChanged || idChanged) {
        nextDays[idx] = {
          ...existing,
          date: dateChanged ? parseLocalDate(dateStr) : existing.date,
          startTime: nextStartTime,
          endTime: nextEndTime,
          timetableId: hasId ? timetableId : existing.timetableId,
        };
        changed = true;
      }
    } else if (dateStr) {
      nextDays.push({
        timetableId,
        date: parseLocalDate(dateStr),
        dayNumber: 0,
        startTime: respVO.timeTableStartTime || DEFAULT_DAY_START,
        endTime: respVO.timeTableEndTime || DEFAULT_DAY_END,
        places: [],
      });
      changed = true;
    }
  });

  if (!changed) return { days: currentDays, changed: false };

  nextDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  return {
    days: nextDays.map((d, i) => ({ ...d, dayNumber: i + 1 })),
    changed: true,
  };
};
