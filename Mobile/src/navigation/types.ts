// src/navigation/types.ts
import { Place } from '../components/itinerary/TimelineItem';
import { Day } from '../contexts/ItineraryContext';

export type AppStackParamList = {
  // ⭐️ 1. Home 화면이 파라미터를 받을 수 있도록 타입을 수정합니다.
  Home:
    | {
        selectedLocation?: string;
        fieldToUpdate?: 'departure' | 'destination';
      }
    | undefined;
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
  ItineraryView: {
    days: Day[];
    tripName: string;
  };
  // ⭐️ 2. 새로 추가될 SearchLocation 화면과 전달할 파라미터 타입을 정의합니다.
  SearchLocation: {
    fieldToUpdate: 'departure' | 'destination';
    currentValue: string;
  };
};
