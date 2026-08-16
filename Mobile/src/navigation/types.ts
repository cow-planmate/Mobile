import { Day } from '../contexts/ItineraryContext';

export type TabParamList = {
  FeedTab: undefined;
  ScheduleTab: undefined;
  CommunityTab: undefined;
};

export type FeedStackParamList = {
  FeedMain: undefined;
  FeedCreate:
    | {
        postId?: string;
      }
    | undefined;
  FeedDetail: {

    postId: string;
  };
};

export type ScheduleStackParamList = {
  MainTabs: undefined;
  MySchedule: undefined;
  Home:
    | {
        selectedLocation?: string;
        fieldToUpdate?: 'departure' | 'destination';
      }
    | undefined;
  ItineraryEditor: {
    planId?: string;
    tripName?: string;
    departure?: string;
    destination?: string;
    travelId?: number;
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    pendingPlace?: any;
  };
  ItineraryView: {

    days?: Day[];
    tripName?: string;
    planId?: string;
    departure?: string;
    destination?: string;
    travelId?: number;
    adults?: number;
    children?: number;
    startDate?: string;
    endDate?: string;
  };
  Profile: undefined;
  ThemeSettings: undefined;
  ChangePassword: undefined;
};

export type AppStackParamList = ScheduleStackParamList;

export type CommunityStackParamList = {
  CommunityMain: undefined;
  CommunityDetail: {
    postId: string;
  };
  CommunityCreate:
    | {

        category?: 'free' | 'qna' | 'mate' | 'recommend';
        postId?: string;
      }
    | undefined;
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

    provider: 'google' | 'naver' | null;
  };
};
