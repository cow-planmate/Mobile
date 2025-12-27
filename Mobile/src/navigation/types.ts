import { Day } from '../types/models';

export type AppStackParamList = {
  Main:
    | {
        selectedLocation?: string;
        fieldToUpdate?: 'departure' | 'destination';
      }
    | undefined;
  ItineraryCreation: {
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    transport: string;
  };

  ItineraryCompletion: {
    days: Day[];
    tripName: string;
  };
  SearchLocation: {
    fieldToUpdate: 'departure' | 'destination';
    currentValue: string;
  };
  MyPage: undefined;
  MyItinerary: undefined;
};
