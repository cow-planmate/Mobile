import { Day } from '../contexts/ItineraryContext';

export type TabParamList = {
  FeedTab: undefined;
  ScheduleTab: undefined;
  CommunityTab: undefined;
};

/**
 * 앱이 시작하는 탭이자 뒤로가기가 수렴하는 탭.
 * 탭 선언 순서와 어긋나기 쉬워 한 곳에서만 정한다.
 */
export const INITIAL_TAB: keyof TabParamList = 'ScheduleTab';

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
  ChangePassword: undefined;
};

export type AppStackParamList = ScheduleStackParamList;

export type CommunityStackParamList = {
  /** 글 상세에서 '전체 보기'로 나올 때는 보던 게시판을 그대로 편다. */
  CommunityMain: { category?: 'free' | 'qna' | 'recommend' } | undefined;
  CommunityDetail: {
    postId: string;
  };
  CommunityCreate:
    | {

        category?: 'free' | 'qna' | 'recommend';
        postId?: string;
      }
    | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
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
