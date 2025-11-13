// src/contexts/ItineraryContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from 'react';
import { Place } from '../components/itinerary/TimelineItem';

export interface Day {
  date: Date;
  dayNumber: number;
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

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);

  const addPlaceToDay = (
    dayIndex: number,
    placeData: Omit<Place, 'startTime' | 'endTime'>,
  ) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }

      const newId = `place_${Date.now()}_${Math.random()}`;

      const placeToAdd: Place = {
        ...placeData,
        id: newId,
        startTime: '12:00',
        endTime: '13:00',
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
      };

      const updatedDays = [...currentDays];
      const newPlacesList = [
        ...updatedDays[dayIndex].places.map(p => ({ ...p })),
        placeToAdd,
      ];

      updatedDays[dayIndex].places = resolveConflictsAndSort(
        newPlacesList,
        placeToAdd.id,
      );

      return updatedDays;
    });
  };

  const deletePlaceFromDay = (dayIndex: number, placeId: string) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }
      const updatedDays = [...currentDays];
      const updatedPlaces = updatedDays[dayIndex].places.filter(
        place => place.id !== placeId,
      );
      updatedDays[dayIndex].places = updatedPlaces;
      return updatedDays;
    });
  };

  const updatePlaceTimes = (
    dayIndex: number,
    placeId: string,
    newStartTime: string,
    newEndTime: string,
  ) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }
      const updatedDays = [...currentDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };

      const newPlacesList = dayToUpdate.places.map(p =>
        p.id === placeId
          ? { ...p, startTime: newStartTime, endTime: newEndTime }
          : { ...p },
      );

      dayToUpdate.places = resolveConflictsAndSort(newPlacesList, placeId);
      updatedDays[dayIndex] = dayToUpdate;

      return updatedDays;
    });
  };

  return (
    <ItineraryContext.Provider
      value={{
        days,
        setDays,
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
