// src/contexts/ItineraryContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from 'react';
import { Place } from '../components/itinerary/TimelineItem';

// 날짜별 일정 데이터 타입
export interface Day {
  date: Date;
  dayNumber: number;
  places: Place[];
}

// Context가 가지게 될 값들의 타입을 정의합니다.
interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  addPlaceToDay: (dayIndex: number, place: Omit<Place, 'time'>) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);

  // 특정 날짜에 장소를 추가하는 함수
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

  return (
    <ItineraryContext.Provider value={{ days, setDays, addPlaceToDay }}>
      {children}
    </ItineraryContext.Provider>
  );
}

// 다른 컴포넌트에서 쉽게 Context 값을 사용하기 위한 Custom Hook
export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
