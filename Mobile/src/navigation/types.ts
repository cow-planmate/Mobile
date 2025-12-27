
import { Place } from '../components/itinerary/TimelineItem';
import { Day } from '../contexts/ItineraryContext';

export type AppStackParamList = {
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




  ItineraryView: {
    days: Day[];
    tripName: string;
  };
  SearchLocation: {
    fieldToUpdate: 'departure' | 'destination';
    currentValue: string;
  };
};
