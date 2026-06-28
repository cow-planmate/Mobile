import { Day } from '../contexts/ItineraryContext';

export type TabParamList = {
  ScheduleTab: undefined;
  CommunityTab: undefined;
  MapTab: undefined;
  ProfileTab: undefined;
};

export type ScheduleStackParamList = {
  MySchedule: undefined;
  Home:
    | {
        selectedLocation?: string;
        fieldToUpdate?: 'departure' | 'destination';
      }
    | undefined;
  ItineraryEditor: {
    planId?: number;
    departure?: string;
    destination?: string;
    travelId?: number;
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    transport?: string;
  };
  ItineraryView: {
    days: Day[];
    tripName: string;
    planId?: number;
    departure?: string;
    destination?: string;
    travelId?: number;
    transport?: string;
    adults?: number;
    children?: number;
    startDate?: string;
    endDate?: string;
  };
  SearchLocation: {
    fieldToUpdate: 'departure' | 'destination';
    currentValue: string;
  };
  AddPlace: {
    dayIndex: number;
    destination?: string;
    planId?: number;
  };
  Profile: undefined;
};

// Aliased for compatibility with existing components using AppStackParamList
export type AppStackParamList = ScheduleStackParamList;

export type CommunityStackParamList = {
  CommunityMain: undefined;
  CommunityDetail: {
    postId: string;
  };
};

export type MapStackParamList = {
  MapMain: undefined;
  PlaceDetail: {
    placeId: string;
  };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ThemeSettings: undefined;
  ChangePassword: undefined;
};

export type AuthStackParamList = {
  Intro: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OAuthAdditionalInfo: {
    signupId: string;
    needEmail: boolean;
  };
};
