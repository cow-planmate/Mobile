// src/navigation/types.ts
import { Place } from '../components/itinerary/TimelineItem';

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
    // ⭐️ newPlace의 타입을 Omit<Place, 'time'>으로 더 구체화
    newPlace?: Omit<Place, 'time'>;
  };
  AddPlace: undefined;
};
