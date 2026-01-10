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
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

const mapToTimetablePlaceBlockDto = (place: Place, timetableId?: number) => {
  // Remap invalid category IDs to valid ones (Foreign Key Constraint Fix)
  // 12 (Tourist), 14 (Cafe?), 15, 28 -> 4 (Valid Tourist/Etc)
  // 32 (Accommodation) -> 1 (Valid Accommodation)
  // 39 (Restaurant) -> 39 (Valid Restaurant)
  let categoryId = place.categoryId || 4;
  if ([12, 14, 15, 28].includes(categoryId)) {
    categoryId = 4;
  } else if (categoryId === 32) {
    categoryId = 1;
  }

  return {
    timetableId: timetableId,
    // External Place ID (e.g. from Google Maps), used for reference
    placeId: place.placeRefId,

    // Internal Database ID for the block (if available and numeric)
    timetablePlaceBlockId: !isNaN(Number(place.id)) ? Number(place.id) : null,

    placeCategoryId: categoryId,
    placeName: place.name,
    placeAddress: place.address,
    placeRating: place.rating,

    xLocation: place.longitude,
    yLocation: place.latitude,

    // Formatting time to "HH:mm:00" for LocalTime compatibility
    startTime:
      place.startTime.length === 5 ? place.startTime + ':00' : place.startTime,
    endTime: place.endTime.length === 5 ? place.endTime + ':00' : place.endTime,
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
        const respVO = data.timetablePlaceBlockVO;
        if (!respVO) return;

        const timetableId = respVO.timetableId;
        const realId = respVO.timetablePlaceBlockId
          ? String(respVO.timetablePlaceBlockId)
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

                // We should probably trust server data for consistency if available,
                // but we want to keep local state if user is editing.
                // Ideally update ID is the most critical part.
                if (realId) {
                  existingPlaces[tempIndex] = {
                    ...existingPlaces[tempIndex],
                    id: realId,
                  };

                  // Update lastAddedPlaceId if it matches the tempId (eventId)
                  // This ensures scrolling to the new place works even if ID changes
                  setLastAddedPlaceId(prev =>
                    prev === eventId ? realId : prev,
                  );
                }
                dayToUpdate.places = existingPlaces;
              } else {
                // If not found by eventId, maybe it came from another user?
                // Or maybe we lost the temp ID.
                // If it's another user's creation, we should see if we already have it (by realId)?
                // But realId is new. So we add it.

                // Check if place with realId already exists (duplicate check)
                if (realId && !dayToUpdate.places.some(p => p.id === realId)) {
                  // Construct Place from VO
                  const newPlace: Place = {
                    id: realId,
                    placeRefId: respVO.placeId,
                    name: respVO.placeName,
                    type: respVO.placeTheme || '기타',
                    startTime: respVO.startTime
                      ? respVO.startTime.substring(0, 5)
                      : '12:00',
                    endTime: respVO.endTime
                      ? respVO.endTime.substring(0, 5)
                      : '13:00',
                    address: respVO.placeAddress,
                    rating: respVO.placeRating,
                    latitude: respVO.yLocation || respVO.ylocation, // Check case sensitivity
                    longitude: respVO.xLocation || respVO.xlocation,
                    imageUrl: respVO.placeLink,
                    categoryId: respVO.placeCategoryId,
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
                // Update existing place
                const existingPlaces = [...dayToUpdate.places];
                existingPlaces[placeIndex] = {
                  ...existingPlaces[placeIndex],
                  startTime: respVO.startTime
                    ? respVO.startTime.substring(0, 5)
                    : existingPlaces[placeIndex].startTime,
                  endTime: respVO.endTime
                    ? respVO.endTime.substring(0, 5)
                    : existingPlaces[placeIndex].endTime,
                  // Potential other updates? For now focus on time.
                };
                // Re-sort/resolve not strictly needed if we trust the update, but good to keep consistency
                dayToUpdate.places = resolveConflictsAndSort(
                  existingPlaces,
                  realId,
                );
              } else {
                // Maybe added by someone else and we missed create?
                // For now, ignore or fetch?
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
        mapToTimetablePlaceBlockDto(finalPlace, dayToUpdate.timetableId),
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
        mapToTimetablePlaceBlockDto(placeToDelete, dayToUpdate.timetableId),
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
        mapToTimetablePlaceBlockDto(finalPlace, dayToUpdate.timetableId),
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
