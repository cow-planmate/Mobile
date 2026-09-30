
import { DEFAULT_DAY_START, DEFAULT_DAY_END } from './timeUtils';

export const TEMP_PLACE_ID_PREFIX = 'place_';

export const createTempPlaceId = () =>
  `${TEMP_PLACE_ID_PREFIX}${Date.now()}_${Math.random()}`;

export const isTempPlaceId = (id?: string | null): boolean =>
  typeof id === 'string' && id.startsWith(TEMP_PLACE_ID_PREFIX);

export const resolveBlockId = (id?: string | null): number | null => {
  if (!id || isTempPlaceId(id)) return null;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const toLocalTime = (time?: string | null): string | undefined => {
  if (!time) return undefined;
  return time.length === 5 ? `${time}:00` : time;
};

export interface TimeTableDtoInput {
  timetableId?: number | null;
  dateString: string;
  startTime?: string;
  endTime?: string;
  planId: string;
}

export interface TimeTableDtoPayload {
  timeTableId: number | null;
  date: string;
  timeTableStartTime: string;
  timeTableEndTime: string;
  planId: string;
}

export const buildTimeTableDto = ({
  timetableId,
  dateString,
  startTime,
  endTime,
  planId,
}: TimeTableDtoInput): TimeTableDtoPayload => ({
  timeTableId: timetableId ?? null,
  date: dateString,
  timeTableStartTime: toLocalTime(startTime) || DEFAULT_DAY_START,
  timeTableEndTime: toLocalTime(endTime) || DEFAULT_DAY_END,
  planId,
});
