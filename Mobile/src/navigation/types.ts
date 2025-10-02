// src/navigation/types.ts
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
  // ⭐️ AddPlace로 이동할 때 dayIndex를 전달
  AddPlace: {
    dayIndex: number;
  };
};
