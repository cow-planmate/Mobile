/**
 * WebSocket 동기화 페이로드 생성 유틸.
 *
 * 서버(sharedsync)의 DTO는 @JsonIgnoreProperties(ignoreUnknown = true)이므로
 * 필드명이 하나라도 어긋나면 값이 조용히 폐기된다. 키 이름은 서버 DTO와 정확히 일치해야 한다.
 */

import { DEFAULT_DAY_START, DEFAULT_DAY_END } from './timeUtils';

/** 서버 blockId가 확정되기 전 로컬에서만 쓰는 임시 장소 ID의 접두사 */
export const TEMP_PLACE_ID_PREFIX = 'place_';

export const createTempPlaceId = () =>
  `${TEMP_PLACE_ID_PREFIX}${Date.now()}_${Math.random()}`;

export const isTempPlaceId = (id?: string | null): boolean =>
  typeof id === 'string' && id.startsWith(TEMP_PLACE_ID_PREFIX);

/**
 * 장소 ID를 서버 blockId(Long)로 변환합니다.
 * 임시 ID이거나 정수가 아니면 null을 반환합니다.
 * 숫자 형태의 외부 placeId가 blockId로 새어 들어가 다른 블록을 덮어쓰는 것을 막습니다.
 */
export const resolveBlockId = (id?: string | null): number | null => {
  if (!id || isTempPlaceId(id)) return null;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/** 'HH:mm' 입력을 LocalTime 호환 'HH:mm:ss'로 정규화합니다. */
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

/** sharedsync TimeTableDto와 키가 일치하는 전송 페이로드 */
export interface TimeTableDtoPayload {
  timeTableId: number | null;
  date: string;
  timeTableStartTime: string;
  timeTableEndTime: string;
  planId: string;
}

/**
 * sharedsync TimeTableDto와 동일한 키 구조의 페이로드를 생성합니다.
 * planId는 부모 인덱스 등록에 필수이며, 누락 시 서버 캐시가 plan 하위로 인덱싱하지 못합니다.
 */
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
