import {
  CATEGORY_NAMES,
  resolveCategoryId,
} from '../../itinerary/components/TimelineItem';
import { ScheduleEntry } from '../../itinerary/components/PlanScheduleList';
import { buildKakaoMapUrl } from '../../../utils/kakaoMapLink';
import { ItineraryDay } from '../types';

/** \ud558\ub8e8\uac00 \uc544\ub2c8\ub77c \uc804\uccb4\ub97c \uace0\ub978 \uc0c1\ud0dc. */
export const ALL_DAYS = -1;

/**
 * \uc5ec\ud589\uae30\uc5d0 \ub2f4\uae34 \uc77c\uc815\uc744 \uc644\uc131 \ud654\uba74\uacfc \uac19\uc740 \uc2dc\uac01 \ubaa9\ub85d \uc904\ub85c \uc62e\uae34\ub2e4.
 *
 * \uc804\uccb4\ub97c \uace0\ub974\uba74 \uba70\uce60\ucc28\uc778\uc9c0\uac00 \uc2dc\uac01\ub9cc\uc73c\ub85c\ub294 \uc548 \ubcf4\uc774\ubbc0\ub85c \uafac\ud45c\ub97c \ub2ec\uc544 \uc900\ub2e4.
 */
export const itineraryEntries = (
  days: ItineraryDay[],
  selectedDay: number,
): ScheduleEntry[] => {
  const showAll = selectedDay === ALL_DAYS;
  const picked = showAll ? days : [days[selectedDay]].filter(Boolean);

  return picked.flatMap((day, dayIndex) =>
    (day.items ?? []).map((item, index) => {
      const categoryId = resolveCategoryId({ category: item.category ?? '' });
      return {
        key: `${day.day ?? dayIndex}-${item.place}-${index}`,
        startTime: item.time,
        endTime: item.endTime ?? undefined,
        categoryId,
        categoryName: CATEGORY_NAMES[categoryId] ?? '\uae30\ud0c0',
        name: item.place,
        subtitle: item.placeAddress ?? item.description ?? undefined,
        memo: item.memo ?? undefined,
        photoUrl: item.photoUrl ?? undefined,
        badge: showAll ? `${day.day ?? dayIndex + 1}\uc77c\ucc28` : undefined,
        mapUrl: buildKakaoMapUrl({
          name: item.place,
          coords:
            item.lat != null && item.lng != null
              ? { lat: item.lat, lng: item.lng }
              : null,
          searchQuery: [item.place, item.placeAddress]
            .filter(Boolean)
            .join(' '),
        }),
      };
    }),
  );
};

export const countPlaces = (days: ItineraryDay[]): number =>
  days.reduce((sum, day) => sum + (day.items?.length ?? 0), 0);
