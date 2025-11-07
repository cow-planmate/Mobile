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

// --- 헬퍼 함수 추가 ---
const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

// 1. (문제 1) 충돌 해결 및 정렬 함수
const resolveConflictsAndSort = (places: Place[]): Place[] => {
  // 1. startTime 기준으로 먼저 정렬
  const sortedPlaces = [...places].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  // 2. 순회하면서 겹치는 일정 밀어내기
  for (let i = 1; i < sortedPlaces.length; i++) {
    const prev = sortedPlaces[i - 1];
    const curr = sortedPlaces[i];

    const prevEndTime = timeToMinutes(prev.endTime);
    const currStartTime = timeToMinutes(curr.startTime);

    // 겹칠 경우 (이전 아이템이 끝나는 시간보다 현재 아이템이 빨리 시작하면)
    if (currStartTime < prevEndTime) {
      const currDuration =
        timeToMinutes(curr.endTime) - timeToMinutes(curr.startTime);

      // 현재 아이템의 시작 시간을 이전 아이템의 종료 시간으로 설정
      curr.startTime = minutesToTime(prevEndTime);
      // 기존 소요 시간을 유지하며 종료 시간도 밀어냄
      curr.endTime = minutesToTime(prevEndTime + currDuration);
    }
  }

  return sortedPlaces;
};
// --- ---

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

      const placeToAdd: Place = {
        ...placeData,
        startTime: '12:00',
        endTime: '13:00',
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
      };

      const updatedDays = [...currentDays];
      const newPlacesList = [...updatedDays[dayIndex].places, placeToAdd];

      // 2. (문제 1) 충돌 해결 함수 적용
      updatedDays[dayIndex].places = resolveConflictsAndSort(newPlacesList);

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
      updatedDays[dayIndex].places = updatedPlaces; // 삭제 시에는 충돌 해결 불필요
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
          : p,
      );

      // 3. (문제 1) 충돌 해결 함수 적용
      dayToUpdate.places = resolveConflictsAndSort(newPlacesList);
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
