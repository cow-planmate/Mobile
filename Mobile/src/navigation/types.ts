import { Day } from '../contexts/ItineraryContext';

export type TabParamList = {
  FeedTab: undefined;
  ScheduleTab: undefined;
  CommunityTab: undefined;
};

export type FeedStackParamList = {
  FeedMain: undefined;
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
    planId?: string;
    departure?: string;
    destination?: string;
    travelId?: number;
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    transport?: string;
    pendingPlace?: any;
  };
  ItineraryView: {
    days: Day[];
    tripName: string;
    planId?: string;
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
    planId?: string;
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
  CommunityCreate:
    | {
        /** 목록에서 보고 있던 게시판을 미리 선택한다 */
        category?: 'free' | 'qna' | 'mate' | 'recommend';
      }
    | undefined;
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
