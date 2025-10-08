// src/navigation/types.ts
import { Place } from '../components/itinerary/TimelineItem';
import { Day } from '../contexts/ItineraryContext'; // Day 타입을 가져옵니다.

export type AppStackParamList = {
  Home: undefined;
  ItineraryEditor: {
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    transport: string;
  };
  AddPlace: {
    dayIndex: number;
  };
  // ⭐️ 1. 새로운 화면과 전달할 데이터 타입을 추가합니다.
  ItineraryView: {
    days: Day[];
    tripName: string;
  };
};
