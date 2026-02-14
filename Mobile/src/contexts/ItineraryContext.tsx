import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
} from 'react';
import { Place } from '../components/itinerary/TimelineItem';
import { useWebSocket } from './WebSocketContext';

export interface Day {
  timetableId?: number;
  date: Date;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  places: Place[];
}

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number) => {
  const snappedMinutes = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(snappedMinutes / 60) % 24;
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

const resolveConflictsAndSort = (
  places: Place[],
  anchorItemId: string | null = null,
): Place[] => {
  const sortedPlaces = [...places].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const anchorIndex = anchorItemId
    ? sortedPlaces.findIndex(p => p.id === anchorItemId)
    : -1;

  if (anchorIndex === -1) {
    for (let i = 1; i < sortedPlaces.length; i++) {
      const prev = sortedPlaces[i - 1];
      const curr = sortedPlaces[i];
      const prevEndTime = timeToMinutes(prev.endTime);
      const currStartTime = timeToMinutes(curr.startTime);

      if (currStartTime < prevEndTime) {
        const currDuration =
          timeToMinutes(curr.endTime) - timeToMinutes(curr.startTime);
        curr.startTime = minutesToTime(prevEndTime);
        curr.endTime = minutesToTime(prevEndTime + currDuration);
      }
    }
    return sortedPlaces;
  }

  const anchor = sortedPlaces[anchorIndex];
  const anchorStart = timeToMinutes(anchor.startTime);
  const anchorEnd = timeToMinutes(anchor.endTime);

  let lastEndTime = anchorEnd;
  for (let i = anchorIndex + 1; i < sortedPlaces.length; i++) {
    const curr = sortedPlaces[i];
    const currStart = timeToMinutes(curr.startTime);

    if (currStart < lastEndTime) {
      const currDuration = timeToMinutes(curr.endTime) - currStart;
      curr.startTime = minutesToTime(lastEndTime);
      curr.endTime = minutesToTime(lastEndTime + currDuration);
      lastEndTime = timeToMinutes(curr.endTime);
    } else {
      lastEndTime = timeToMinutes(curr.endTime);
    }
  }

  let lastStartTime = anchorStart;
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const curr = sortedPlaces[i];
    const currEnd = timeToMinutes(curr.endTime);

    if (currEnd > lastStartTime) {
      const currDuration = currEnd - timeToMinutes(curr.startTime);
      curr.endTime = minutesToTime(lastStartTime);
      curr.startTime = minutesToTime(lastStartTime - currDuration);
      lastStartTime = timeToMinutes(curr.startTime);
    } else {
      lastStartTime = timeToMinutes(curr.startTime);
    }
  }

  return sortedPlaces;
};

interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  lastAddedPlaceId: string | null;
  setLastAddedPlaceId: React.Dispatch<React.SetStateAction<string | null>>;
  addPlaceToDay: (
    dayIndex: number,
    place: Omit<Place, 'startTime' | 'endTime'>,
  ) => void;
  deletePlaceFromDay: (dayIndex: number, placeId: string) => void;
  updatePlaceTimes: (
    dayIndex: number,
    placeId: string,
    newStartTime: string,
    newEndTime: string,
  ) => void;
  updatePlaceMemo: (dayIndex: number, placeId: string, memo: string) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

const categoryMapping = (
  id: number,
): '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타' => {
  if ([0, 12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 1 || id === 32) return '숙소';
  if (id === 2 || id === 39) return '식당';
  if (id === 3) return '직접 추가';
  if (id === 4) return '검색';
  return '기타';
};

/**
 * Normalize raw categoryId (e.g. Google API IDs) to 0-4 range used by the app.
 */
const normalizeCategoryId = (
  rawId: number | undefined,
  type?: string,
): number => {
  const id = rawId ?? 4;
  if ([0, 1, 2, 3, 4].includes(id)) return id;
  if ([12, 14, 15, 28].includes(id)) return 0; // 관광지
  if (id === 32) return 1; // 숙소
  if (id === 39) return 2; // 식당
  switch (type) {
    case '관광지':
      return 0;
    case '숙소':
      return 1;
    case '식당':
      return 2;
    case '직접 추가':
      return 3;
    default:
      return 4;
  }
};

const mapToTimetablePlaceBlockDto = (
  place: Place,
  timetableId?: number,
  date?: string,
) => {
  // Remap category IDs to backend table IDs (0:관광지, 1:숙소, 2:식당, 3:직접추가, 4:검색)
  let categoryId = place.categoryId ?? 4;

  // If the category is already 0, 1, 2, 3, 4, we keep it.
  // Otherwise, we map based on the raw ID from various sources or the type string.
  if (![0, 1, 2, 3, 4].includes(categoryId)) {
    if ([12, 14, 15, 28].includes(categoryId)) {
      categoryId = 0; // 관광지
    } else if (categoryId === 32) {
      categoryId = 1; // 숙소
    } else if (categoryId === 39) {
      categoryId = 2; // 식당
    } else {
      // Final fallback to the type string provided by the Search API / Editor
      switch (place.type) {
        case '관광지':
          categoryId = 0;
          break;
        case '숙소':
          categoryId = 1;
          break;
        case '식당':
          categoryId = 2;
          break;
        default:
          categoryId = 4; // 검색
      }
    }
  }

  // Formatting time to "HH:mm:00" for LocalTime compatibility
  const startTime =
    place.startTime.length === 5 ? place.startTime + ':00' : place.startTime;
  const endTime =
    place.endTime.length === 5 ? place.endTime + ':00' : place.endTime;

  return {
    blockId: !isNaN(Number(place.id)) ? Number(place.id) : null,
    timetablePlaceBlockId: !isNaN(Number(place.id)) ? Number(place.id) : null, // Added for Web compat
    timeTableId: timetableId,
    timetableId: timetableId, // Added for Web compat
    date: date, // Added date for Backend mapping
    placeId: place.placeRefId,
    placeCategoryId: categoryId,
    placeCategory: categoryId, // Added for Web compat
    placeName: place.name,
    placeAddress: place.address,
    placeRating: place.rating,
    placeLink: place.place_url || '',
    xLocation: place.longitude,
    yLocation: place.latitude,
    xlocation: place.longitude, // Added for Web compat
    ylocation: place.latitude, // Added for Web compat
    photoUrl: place.imageUrl,
    memo: place.memo || '',
    // Aligned field names for both REST and WebSocket DTOs
    startTime: startTime,
    endTime: endTime,
    blockStartTime: startTime,
    blockEndTime: endTime,
  };
};

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);
  const [lastAddedPlaceId, setLastAddedPlaceId] = useState<string | null>(null);
  const { sendMessage, subscribeToMessages, unsubscribeFromMessages } =
    useWebSocket();

  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      // msg structure: { type: 'create' | 'update' | ..., target: 'timetableplaceblock' | ..., data: any, eventId?: string }
      const { type, target, data, eventId } = msg;

      if (target === 'timetableplaceblock') {
        const dataList =
          data.timeTablePlaceBlockDtos || data.timetableplaceblocks;
        if (!dataList || !Array.isArray(dataList)) return;

        dataList.forEach((respVO: any) => {
          const timetableId = respVO.timeTableId || respVO.timetableId;
          const realId =
            respVO.blockId || respVO.timetablePlaceBlockId
              ? String(respVO.blockId || respVO.timetablePlaceBlockId)
              : null;

          setDays(prevDays => {
            const dayIndex = prevDays.findIndex(
              d => d.timetableId === timetableId,
            );
            if (dayIndex === -1) return prevDays;

            const updatedDays = [...prevDays];
            const dayToUpdate = { ...updatedDays[dayIndex] };

            if (type === 'create') {
              // If we have an eventId (tempId), try to find the placeholder
              if (eventId) {
                const tempIndex = dayToUpdate.places.findIndex(
                  p => p.id === eventId,
                );
                if (tempIndex !== -1) {
                  // Update the placeholder with real ID and potentially server data
                  const existingPlaces = [...dayToUpdate.places];

                  if (realId) {
                    existingPlaces[tempIndex] = {
                      ...existingPlaces[tempIndex],
                      id: realId,
                    };

                    setLastAddedPlaceId(prev =>
                      prev === eventId ? realId : prev,
                    );
                  }
                  dayToUpdate.places = existingPlaces;
                } else {
                  const parseTime = (time: any) => {
                    if (typeof time === 'string') return time.substring(0, 5);
                    if (time && typeof time.hour === 'number') {
                      return `${String(time.hour).padStart(2, '0')}:${String(
                        time.minute,
                      ).padStart(2, '0')}`;
                    }
                    return '12:00';
                  };

                  if (
                    realId &&
                    !dayToUpdate.places.some(p => p.id === realId)
                  ) {
                    const rawCategoryId =
                      respVO.placeCategoryId ?? respVO.placeCategory ?? 4;
                    const newPlace: Place = {
                      id: realId,
                      placeRefId: respVO.placeId,
                      name: respVO.placeName,
                      type: categoryMapping(rawCategoryId),
                      startTime: parseTime(
                        respVO.startTime ?? respVO.blockStartTime,
                      ),
                      endTime: parseTime(respVO.endTime ?? respVO.blockEndTime),
                      address: respVO.placeAddress,
                      rating: respVO.placeRating,
                      latitude: respVO.yLocation ?? respVO.ylocation ?? 0,
                      longitude: respVO.xLocation ?? respVO.xlocation ?? 0,
                      imageUrl: respVO.photoUrl || respVO.placeLink,
                      categoryId: normalizeCategoryId(rawCategoryId),
                    };
                    dayToUpdate.places = resolveConflictsAndSort([
                      ...dayToUpdate.places,
                      newPlace,
                    ]);
                  }
                }
              }
            } else if (type === 'update') {
              if (realId) {
                const placeIndex = dayToUpdate.places.findIndex(
                  p => p.id === realId,
                );
                if (placeIndex !== -1) {
                  const parseTime = (time: any) => {
                    if (typeof time === 'string') return time.substring(0, 5);
                    if (time && typeof time.hour === 'number') {
                      return `${String(time.hour).padStart(2, '0')}:${String(
                        time.minute,
                      ).padStart(2, '0')}`;
                    }
                    return '12:00';
                  };

                  const existingPlaces = [...dayToUpdate.places];
                  const newStartTime =
                    respVO.startTime ?? respVO.blockStartTime;
                  const newEndTime = respVO.endTime ?? respVO.blockEndTime;

                  existingPlaces[placeIndex] = {
                    ...existingPlaces[placeIndex],
                    startTime: newStartTime
                      ? parseTime(newStartTime)
                      : existingPlaces[placeIndex].startTime,
                    endTime: newEndTime
                      ? parseTime(newEndTime)
                      : existingPlaces[placeIndex].endTime,
                    memo:
                      respVO.memo !== undefined
                        ? respVO.memo
                        : existingPlaces[placeIndex].memo,
                  };
                  dayToUpdate.places = resolveConflictsAndSort(
                    existingPlaces,
                    realId,
                  );
                }
              }
            } else if (type === 'delete') {
              if (realId) {
                dayToUpdate.places = dayToUpdate.places.filter(
                  p => p.id !== realId,
                );
              }
            }

            updatedDays[dayIndex] = dayToUpdate;
            return updatedDays;
          });
        });
      }
    },
    [setDays],
  );

  useEffect(() => {
    if (subscribeToMessages) {
      subscribeToMessages(handleWebSocketMessage);
    }
    return () => {
      if (unsubscribeFromMessages) {
        unsubscribeFromMessages(handleWebSocketMessage);
      }
    };
  }, [subscribeToMessages, unsubscribeFromMessages, handleWebSocketMessage]);

  const addPlaceToDay = (
    dayIndex: number,
    placeData: Omit<Place, 'startTime' | 'endTime'>,
  ) => {
    if (days.length === 0 || !days[dayIndex]) {
      return;
    }

    const newId = `place_${Date.now()}_${Math.random()}`;

    const placeToAdd: Place = {
      ...placeData,
      id: newId,
      placeRefId: placeData.id,
      categoryId: normalizeCategoryId(placeData.categoryId, placeData.type),
      startTime: '12:00',
      endTime: '13:00',
      latitude: placeData.latitude ?? 0,
      longitude: placeData.longitude ?? 0,
    };

    const updatedDays = [...days];
    const dayToUpdate = { ...updatedDays[dayIndex] };
    const newPlacesList = [
      ...dayToUpdate.places.map(p => ({ ...p })),
      placeToAdd,
    ];

    dayToUpdate.places = resolveConflictsAndSort(newPlacesList, placeToAdd.id);
    updatedDays[dayIndex] = dayToUpdate;

    setDays(updatedDays);
    setLastAddedPlaceId(newId);

    const finalPlace = dayToUpdate.places.find(p => p.id === newId);
    if (finalPlace) {
      sendMessage(
        'create',
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(
          finalPlace,
          dayToUpdate.timetableId,
          dayToUpdate.date.toISOString().split('T')[0],
        ),
        newId, // Pass eventId
      );
    }
  };

  const deletePlaceFromDay = (dayIndex: number, placeId: string) => {
    if (days.length === 0 || !days[dayIndex]) {
      return;
    }
    const updatedDays = [...days];
    const dayToUpdate = { ...updatedDays[dayIndex] };

    // Find the place before deleting to send the DTO (at least ID is needed)
    const placeToDelete = dayToUpdate.places.find(p => p.id === placeId);

    dayToUpdate.places = dayToUpdate.places.filter(
      place => place.id !== placeId,
    );
    updatedDays[dayIndex] = dayToUpdate;

    setDays(updatedDays);
    setLastAddedPlaceId(null);

    if (placeToDelete) {
      sendMessage(
        'delete',
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(
          placeToDelete,
          dayToUpdate.timetableId,
          dayToUpdate.date.toISOString().split('T')[0],
        ),
      );
    }
  };

  const updatePlaceTimes = (
    dayIndex: number,
    placeId: string,
    newStartTime: string,
    newEndTime: string,
  ) => {
    if (days.length === 0 || !days[dayIndex]) {
      return;
    }
    const updatedDays = [...days];
    const dayToUpdate = { ...updatedDays[dayIndex] };

    const newPlacesList = dayToUpdate.places.map(p =>
      p.id === placeId
        ? { ...p, startTime: newStartTime, endTime: newEndTime }
        : { ...p },
    );

    dayToUpdate.places = resolveConflictsAndSort(newPlacesList, placeId);
    updatedDays[dayIndex] = dayToUpdate;

    setDays(updatedDays);
    setLastAddedPlaceId(null);

    const finalPlace = dayToUpdate.places.find(p => p.id === placeId);
    if (finalPlace) {
      sendMessage(
        'update',
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(
          finalPlace,
          dayToUpdate.timetableId,
          dayToUpdate.date.toISOString().split('T')[0],
        ),
      );
    }
  };

  const updatePlaceMemo = (dayIndex: number, placeId: string, memo: string) => {
    if (days.length === 0 || !days[dayIndex]) {
      return;
    }
    const updatedDays = [...days];
    const dayToUpdate = { ...updatedDays[dayIndex] };

    dayToUpdate.places = dayToUpdate.places.map(p =>
      p.id === placeId ? { ...p, memo } : { ...p },
    );
    updatedDays[dayIndex] = dayToUpdate;

    setDays(updatedDays);

    const finalPlace = dayToUpdate.places.find(p => p.id === placeId);
    if (finalPlace) {
      sendMessage(
        'update',
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(
          finalPlace,
          dayToUpdate.timetableId,
          dayToUpdate.date.toISOString().split('T')[0],
        ),
      );
    }
  };

  return (
    <ItineraryContext.Provider
      value={{
        days,
        setDays,
        lastAddedPlaceId,
        setLastAddedPlaceId,
        addPlaceToDay,
        deletePlaceFromDay,
        updatePlaceTimes,
        updatePlaceMemo,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
