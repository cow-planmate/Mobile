import { formatDateLocal } from '../../../utils/timeUtils';
import { Itinerary, ItineraryDay, ItineraryItem } from '../types';

/**
 * 여행기에 박힌 일정 스냅샷을 Backend-v2의 `POST /api/plan/full` 요청으로 변환한다.
 *
 * "가져가기"는 원본 플랜을 조회하지 않고 이 스냅샷만으로 새 플랜을 만든다.
 * 서버 검증(중복 날짜 / 같은 날 블록 시간 중복 / 블록 날짜가 타임테이블에 존재)을
 * 통과하도록 여기서 미리 정리한 뒤 보낸다.
 */

const DEFAULT_DAY_START = '09:00';
const DEFAULT_DAY_END = '20:00';
const DEFAULT_BLOCK_MINUTES = 30;
/** 스냅샷에 장소명이 비어 있을 때 대신 넣을 값 */
const DEFAULT_PLACE_NAME = '이름 없는 장소';

/**
 * 서버 BlockCategory enum 값.
 *
 * 이 목록 밖의 값이 하나라도 섞이면 역직렬화 단계에서 400이 나 가져가기 전체가
 * 실패한다. 스냅샷은 게시 시점의 값이 그대로 굳은 것이라 최신 enum과 어긋날 수
 * 있으므로 여기서 걸러 낸다(placeName을 대체하는 것과 같은 이유).
 */
const BLOCK_CATEGORIES = new Set([
  'ATTRACTION',
  'ACCOMMODATION',
  'RESTAURANT',
  'FREE',
  'SEARCH',
]);

const toBlockCategory = (category?: string | null): string =>
  category && BLOCK_CATEGORIES.has(category) ? category : 'FREE';

export interface CreatePlanRequestBody {
  planFrame: {
    destinationId: number;
    adultCount: number;
    childCount: number;
  };
  timetables: {
    date: string;
    timeTableStartTime: string;
    timeTableEndTime: string;
  }[];
  timetablePlaceBlocks: Record<string, unknown>[];
}

export interface ConversionResult {
  body: CreatePlanRequestBody;
  /** 시간이 겹쳐서 뒤로 밀린 블록 수 — 사용자에게 알려줄 값 */
  adjustedBlocks: number;
}

/** plan 스냅샷이 없는 구 스키마 게시글은 플랜을 만들 수 없다 */
export const canForkItinerary = (itinerary?: Itinerary | null): boolean =>
  itinerary?.plan?.destinationId != null && (itinerary.days?.length ?? 0) > 0;

const toMinutes = (hhmm: string): number => {
  const [h, m] = (hhmm ?? '').split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

/** 하루의 마지막 분(23:59). 이 뒤로는 같은 날짜에 블록을 둘 수 없다. */
const DAY_LAST_MINUTE = 23 * 60 + 59;

const toHHmm = (minutes: number): string => {
  const clamped = Math.max(0, Math.min(DAY_LAST_MINUTE, minutes));
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * 스냅샷의 시각을 서버 LocalTime('HH:mm:ss')으로 맞춘다.
 *
 * 스냅샷에는 'HH:mm'과 'HH:mm:ss'가 섞여 들어올 수 있어, 뒤에 ':00'을 그대로
 * 붙이면 'HH:mm:ss:00'이 되어 하루가 아니라 요청 전체가 400으로 실패한다.
 */
const toLocalTime = (time: string | null | undefined, fallback: string): string => {
  const [rawHour, rawMinute] = String(time ?? '').split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return `${fallback}:00`;
  }
  return `${toHHmm(hour * 60 + minute)}:00`;
};

const addDays = (start: Date, offset: number): string => {
  const date = new Date(start);
  date.setDate(date.getDate() + offset);
  return formatDateLocal(date);
};

/**
 * 같은 날 블록들의 시간 겹침을 제거한다.
 *
 * Backend-v2의 validateNoDuplicateBlockTimes는 시작 시각이 같은 블록을 거부하므로,
 * 스냅샷에 겹치는 블록이 있으면 400이 되어 가져가기 전체가 실패한다.
 * 순서를 지키기 위해 겹치는 블록은 앞 블록 종료 시각 뒤로 민다.
 *
 * 밀다 보면 자정을 넘길 수 있는데, 그때 시각을 23:59로 잘라내면 여러 블록의
 * 시작 시각이 23:59로 같아져 막으려던 400이 그대로 난다. 그래서 뒤에 남은
 * 블록 수만큼 자리를 미리 비워 두고, 다음 블록은 항상 최소 1분 뒤에서 시작시킨다.
 */
const resolveOverlaps = (
  items: ItineraryItem[],
): { start: string; end: string; shifted: boolean }[] => {
  let cursor = -1;
  return items.map((item, index) => {
    const rawStart = toMinutes(item.time);
    const rawEnd = item.endTime
      ? toMinutes(item.endTime)
      : rawStart + DEFAULT_BLOCK_MINUTES;
    const duration = Math.max(rawEnd - rawStart, DEFAULT_BLOCK_MINUTES);

    // 남은 블록마다 1분씩은 남겨 둬야 시작 시각이 서로 겹치지 않는다.
    const latestStart = Math.max(
      0,
      DAY_LAST_MINUTE - (items.length - 1 - index),
    );
    const start = Math.min(Math.max(rawStart, cursor), latestStart);
    const end = Math.min(Math.max(start + duration, start), DAY_LAST_MINUTE);

    // 잘려서 길이가 0이 된 블록 뒤에도 다음 시작 시각은 반드시 더 커야 한다.
    cursor = Math.max(end, start + 1);

    return {
      start: toHHmm(start),
      end: toHHmm(end),
      shifted: start !== rawStart,
    };
  });
};

const sortedItems = (day: ItineraryDay): ItineraryItem[] =>
  [...(day.items ?? [])].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

/** 스냅샷 + 사용자가 고른 시작일 → 플랜 생성 요청 본문 */
export const buildCreatePlanRequest = (
  itinerary: Itinerary,
  startDate: Date,
): ConversionResult => {
  const plan = itinerary.plan;
  if (!plan) {
    throw new Error('일정 정보가 없는 여행기입니다.');
  }

  const days = itinerary.days ?? [];
  let adjustedBlocks = 0;

  const timetables = days.map((day, idx) => {
    const timeTableStartTime = toLocalTime(day.startTime, DEFAULT_DAY_START);
    let timeTableEndTime = toLocalTime(day.endTime, DEFAULT_DAY_END);
    // 서버 TimetableDto는 시작 ≤ 종료를 요구한다. 자릿수가 고정이라 문자열 비교로 충분.
    if (timeTableEndTime < timeTableStartTime) {
      timeTableEndTime = `${toHHmm(DAY_LAST_MINUTE)}:00`;
    }

    return {
      date: addDays(startDate, idx),
      timeTableStartTime,
      timeTableEndTime,
    };
  });

  const timetablePlaceBlocks = days.flatMap((day, idx) => {
    const date = addDays(startDate, idx);
    const items = sortedItems(day);
    const times = resolveOverlaps(items);

    return items.map((item, i) => {
      const { start, end, shifted } = times[i];
      if (shifted) adjustedBlocks += 1;

      return {
        date,
        blockCategory: toBlockCategory(item.category),
        // 서버 placeName은 @NotBlank다. 스냅샷에 빈 이름이 하나라도 있으면
        // 가져가기 전체가 400으로 실패하므로 여기서 대체한다.
        placeName: item.place?.trim() || DEFAULT_PLACE_NAME,
        placeId: item.placeId ?? null,
        placeContentTypeId: item.placeContentTypeId ?? null,
        placeAddress: item.placeAddress ?? item.description ?? null,
        placeThumbnailUrl: item.photoUrl ?? null,
        placeCopyrightDivCd: item.placeCopyrightDivCd ?? null,
        latitude: item.lat ?? null,
        longitude: item.lng ?? null,
        blockStartTime: `${start}:00`,
        blockEndTime: `${end}:00`,
        memo: item.memo ?? null,
      };
    });
  });

  return {
    body: {
      planFrame: {
        destinationId: plan.destinationId,
        adultCount: plan.adultCount ?? 0,
        childCount: plan.childCount ?? 0,
      },
      timetables,
      timetablePlaceBlocks,
    },
    adjustedBlocks,
  };
};

/** 시작일에서 N일차까지의 종료일 (미리보기용) */
export const getEndDate = (startDate: Date, dayCount: number): Date => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + Math.max(0, dayCount - 1));
  return end;
};
