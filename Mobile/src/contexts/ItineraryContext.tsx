// src/contexts/ItineraryContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from 'react';
// Place 타입 임포트 경로가 수정되었을 수 있으니 확인
import { Place } from '../components/itinerary/TimelineItem';

export interface Day {
  date: Date;
  dayNumber: number;
  places: Place[];
}

interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  addPlaceToDay: (
    dayIndex: number,
    place: Omit<Place, 'startTime' | 'endTime'>,
  ) => void;
  deletePlaceFromDay: (dayIndex: number, placeId: string) => void;
  // updatePlaceTime: (dayIndex: number, placeId: string, newTime: string) => void;
  // startTime, endTime을 모두 업데이트하는 함수로 변경 (혹은 2개로 분리)
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

  // Omit 타입을 startTime, endTime 기준으로 수정
  const addPlaceToDay = (
    dayIndex: number,
    placeData: Omit<Place, 'startTime' | 'endTime'>,
  ) => {
    setDays(currentDays => {
      if (currentDays.length === 0 || !currentDays[dayIndex]) {
        return currentDays;
      }

      // 새 장소에 기본 startTime과 endTime을 할당합니다.
      const placeToAdd: Place = {
        ...placeData,
        startTime: '12:00', // 기본 시작 시간
        endTime: '13:00', // 기본 종료 시간 (1시간)
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
      };

      const updatedDays = [...currentDays];
      const updatedPlaces = [...updatedDays[dayIndex].places, placeToAdd];

      // 정렬 기준을 startTime으로 변경
      updatedPlaces.sort((a, b) => a.startTime.localeCompare(b.startTime));

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

  // updatePlaceTime -> updatePlaceTimes로 수정
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
      const placeIndex = dayToUpdate.places.findIndex(p => p.id === placeId);

      if (placeIndex > -1) {
        const updatedPlaces = [...dayToUpdate.places];
        updatedPlaces[placeIndex] = {
          ...updatedPlaces[placeIndex],
          startTime: newStartTime,
          endTime: newEndTime,
        };
        // 정렬 기준을 startTime으로 변경
        updatedPlaces.sort((a, b) => a.startTime.localeCompare(b.startTime));
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
        updatePlaceTimes, // 함수 이름 변경
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
