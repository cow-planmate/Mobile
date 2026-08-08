import { Itinerary, ItineraryItem } from '../types';

type TimeValue = string | { hour: number; minute: number } | null | undefined;

export interface CompletePlanResponse {
  planFrame: {
    planId: string;
    planName: string;
    destinationId: number;
    destinationName: string;
    adultCount: number;
    childCount: number;
    transportationType: string;
  };
  timetables: Array<{
    timeTableId: number;
    date: string;
    timeTableStartTime: TimeValue;
    timeTableEndTime: TimeValue;
  }>;
  placeBlocks: Array<{
    timeTableId: number;
    placeId?: string | null;
    placeName: string;
    placeContentTypeId?: string | null;
    placeAddress?: string | null;
    placeThumbnailUrl?: string | null;
    placeCopyrightDivCd?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    blockStartTime: TimeValue;
    blockEndTime: TimeValue;
    blockCategory?: string | null;
    memo?: string | null;
  }>;
}

export interface FeedPlanSnapshot {
  planId: string;
  planName: string;
  destinationName: string;
  thumbnailUrl?: string;
  itinerary: Itinerary;
}

const toHHmm = (value: TimeValue, fallback: string): string => {
  if (typeof value === 'string' && value.length >= 5) {
    return value.slice(0, 5);
  }
  if (value && typeof value === 'object') {
    return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
  }
  return fallback;
};

export function buildFeedPlanSnapshot(
  response: CompletePlanResponse,
): FeedPlanSnapshot {
  const { planFrame, timetables, placeBlocks } = response;

  if (!planFrame?.destinationId || !planFrame.transportationType) {
    throw new Error('여행기로 발행할 수 있는 일정 정보가 아닙니다.');
  }

  const days = [...(timetables ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((timetable, index) => {
      const items: ItineraryItem[] = (placeBlocks ?? [])
        .filter(block => block.timeTableId === timetable.timeTableId)
        .sort((a, b) =>
          toHHmm(a.blockStartTime, '00:00').localeCompare(
            toHHmm(b.blockStartTime, '00:00'),
          ),
        )
        .map(block => ({
          time: toHHmm(block.blockStartTime, '09:00'),
          endTime: toHHmm(block.blockEndTime, '20:00'),
          place: block.placeName,
          description: block.placeAddress ?? null,
          lat: block.latitude ?? null,
          lng: block.longitude ?? null,
          category: block.blockCategory ?? 'FREE',
          photoUrl: block.placeThumbnailUrl ?? null,
          placeId: block.placeId ?? null,
          placeContentTypeId: block.placeContentTypeId ?? null,
          placeAddress: block.placeAddress ?? null,
          placeCopyrightDivCd: block.placeCopyrightDivCd ?? null,
          memo: block.memo ?? null,
        }));

      return {
        day: index + 1,
        date: timetable.date,
        startTime: toHHmm(timetable.timeTableStartTime, '09:00'),
        endTime: toHHmm(timetable.timeTableEndTime, '20:00'),
        items,
      };
    });

  if (days.length === 0) {
    throw new Error('발행할 일정이 없습니다.');
  }

  return {
    planId: planFrame.planId,
    planName: planFrame.planName,
    destinationName: planFrame.destinationName,
    thumbnailUrl: days.flatMap(day => day.items).find(item => item.photoUrl)
      ?.photoUrl ?? undefined,
    itinerary: {
      plan: {
        destinationId: planFrame.destinationId,
        destinationName: planFrame.destinationName,
        transportationType: planFrame.transportationType,
        adultCount: planFrame.adultCount,
        childCount: planFrame.childCount,
      },
      days,
    },
  };
}
