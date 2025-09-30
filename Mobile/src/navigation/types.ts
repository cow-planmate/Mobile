// src/navigation/types.ts

// ⭐️ 1. Place 타입을 여기서도 공유할 수 있도록 export 합니다. (또는 별도 types 파일로 분리)
import { Place } from '../components/itinerary/TimelineItem';

export type AppStackParamList = {
  Home: undefined;
  ItineraryEditor: {
    // ... 기존 파라미터들
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    transport: string;
    // ⭐️ 2. AddPlaceScreen에서 돌아올 때 받을 파라미터 (선택적)
    newPlace?: { id: string; name: string };
  };
  // ⭐️ 3. AddPlace 화면 추가
  AddPlace: undefined;
};
