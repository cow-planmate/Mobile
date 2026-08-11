/**
 * WebSocket으로 수신한 timetable(create/update/delete) 브로드캐스트를
 * 로컬 일차 목록에 반영하는 순수 병합 로직.
 *
 * timetableId를 우선 매칭한다. 날짜만으로 매칭하면 날짜를 옮긴 일차(일정 변경이
 * update로 전달됨, utils/scheduleEditSync 참고)가 옛 로컬 날짜와 매칭되지 않아
 * 새 일차로 추가되고, 장소를 가진 원래 일차는 옛 날짜인 채로 남아 같은
 * timetableId를 가진 일차가 중복 생성된다. 로컬에 아직 서버 ID가 없는 신규
 * 일차(생성 요청 응답 대기 중)만 날짜로 폴백해 매칭한다.
 */

import type { Day } from '../contexts/ItineraryContext';
import {
  formatDateLocal,
  parseLocalDate,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from './timeUtils';

const normalizeTime = (time?: string): string => (time || '').substring(0, 5);

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
