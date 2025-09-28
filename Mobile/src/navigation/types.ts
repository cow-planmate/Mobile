// src/navigation/types.ts
export type AppStackParamList = {
  Home: undefined; // Home 화면은 파라미터를 받지 않음
  ItineraryEditor: {
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    transport: string;
  };
};
