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
  deletePlaceFromDay: (dayIndex: number, placeId: string) => void; // ⭐️ 1. 삭제 함수 타입 추가
  updatePlaceTime: (dayIndex: number, placeId: string, newTime: string) => void; // ⭐️ 1. 시간 수정 함수 타입 추가
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
      const placeToAdd: Place = { ...placeData, time: '미정' };

      const updatedDays = [...currentDays];
      const updatedPlaces = [...updatedDays[dayIndex].places, placeToAdd];

      updatedPlaces.sort((a, b) => a.time.localeCompare(b.time));

      updatedDays[dayIndex].places = updatedPlaces;
      return updatedDays;
    });
  };

  // ⭐️ 2. 장소를 삭제하는 함수 구현
  const deletePlaceFromDay = (dayIndex: number, placeId: string) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }

      const updatedDays = [...currentDays];
      // `filter`를 사용해 삭제할 placeId와 다른 항목들만 남겨 새 배열을 만듭니다.
      const updatedPlaces = updatedDays[dayIndex].places.filter(
        place => place.id !== placeId,
      );

      updatedDays[dayIndex].places = updatedPlaces;
      return updatedDays;
    });
  };

  // ⭐️ 2. 장소의 시간을 수정하는 함수 구현
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

        // 시간순으로 재정렬
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
