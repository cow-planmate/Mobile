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

interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  addPlaceToDay: (dayIndex: number, place: Omit<Place, 'time'>) => void;
  deletePlaceFromDay: (dayIndex: number, placeId: string) => void;
  updatePlaceTime: (dayIndex: number, placeId: string, newTime: string) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);

  const addPlaceToDay = (dayIndex: number, placeData: Omit<Place, 'time'>) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }
      // ⭐️⭐️⭐️ 여기가 수정된 부분입니다! ⭐️⭐️⭐️
      // placeData에 latitude나 longitude가 없을 경우, 기본값(0)을 할당해줍니다.
      const placeToAdd: Place = {
        ...placeData,
        time: '미정',
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
      };

      const updatedDays = [...currentDays];
      const updatedPlaces = [...updatedDays[dayIndex].places, placeToAdd];

      updatedPlaces.sort((a, b) => a.time.localeCompare(b.time));

      updatedDays[dayIndex].places = updatedPlaces;
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

  const updatePlaceTime = (
    dayIndex: number,
    placeId: string,
    newTime: string,
  ) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }
      const updatedDays = [...currentDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };
      const placeIndex = dayToUpdate.places.findIndex(p => p.id === placeId);

      if (placeIndex > -1) {
        const updatedPlaces = [...dayToUpdate.places];
        updatedPlaces[placeIndex] = {
          ...updatedPlaces[placeIndex],
          time: newTime,
        };
        updatedPlaces.sort((a, b) => a.time.localeCompare(b.time));
        dayToUpdate.places = updatedPlaces;
        updatedDays[dayIndex] = dayToUpdate;
      }

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
        updatePlaceTime,
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
