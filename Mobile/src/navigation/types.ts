import { Day } from '../contexts/ItineraryContext';

export type AppStackParamList = {
  Home:
    | {
        selectedLocation?: string;
        fieldToUpdate?: 'departure' | 'destination';
      }
    | undefined;
  Profile: undefined;
  ItineraryEditor: {
    planId?: number;
    departure: string;
    destination: string;
    travelId: number;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    transport: string;
  };

  ItineraryView: {
    days: Day[];
    tripName: string;
    departure: string;
    travelId: number;
    transport: string;
    adults: number;
    children: number;
    startDate: string;
    endDate: string;
  };
  SearchLocation: {
    fieldToUpdate: 'departure' | 'destination';
    currentValue: string;
  };
};
