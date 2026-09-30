import { formatDateLocal } from '../../../utils/timeUtils';
import { Itinerary, ItineraryDay, ItineraryItem } from '../types';

const DEFAULT_DAY_START = '09:00';
const DEFAULT_DAY_END = '20:00';
const DEFAULT_BLOCK_MINUTES = 30;

const DEFAULT_PLACE_NAME = '이름 없는 장소';

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

  adjustedBlocks: number;
}

export const canForkItinerary = (itinerary?: Itinerary | null): boolean =>
  itinerary?.plan?.destinationId != null && (itinerary.days?.length ?? 0) > 0;

const toMinutes = (hhmm: string): number => {
  const [h, m] = (hhmm ?? '').split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

const DAY_LAST_MINUTE = 23 * 60 + 59;

const toHHmm = (minutes: number): string => {
  const clamped = Math.max(0, Math.min(DAY_LAST_MINUTE, minutes));
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return `${h}:${m}`;
};

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

    const latestStart = Math.max(
      0,
      DAY_LAST_MINUTE - (items.length - 1 - index),
    );
    const start = Math.min(Math.max(rawStart, cursor), latestStart);
    const end = Math.min(Math.max(start + duration, start), DAY_LAST_MINUTE);

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

export const buildCreatePlanRequest = (
  itinerary: Itinerary,
  startDate: Date,
): ConversionResult => {
  const plan = itinerary.plan;
  if (!plan) {
    throw new Error('일정 정보가 없는 여행기예요.');
  }

  const days = itinerary.days ?? [];
  let adjustedBlocks = 0;

  const timetables = days.map((day, idx) => {
    const timeTableStartTime = toLocalTime(day.startTime, DEFAULT_DAY_START);
    let timeTableEndTime = toLocalTime(day.endTime, DEFAULT_DAY_END);

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
