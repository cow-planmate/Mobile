import { Day } from '../contexts/ItineraryContext';

export type TabParamList = {
  FeedTab: undefined;
  ScheduleTab: undefined;
  CommunityTab: undefined;
};

export type FeedStackParamList = {
  FeedMain: undefined;
  FeedDetail: {
    /** 커뮤니티 여행기(category=feed) 게시글 ID */
    postId: string;
  };
};

/**
 * 화면들이 `AppStackParamList`로 참조하는 라우트 목록.
 *
 * 실제로는 ScheduleStack(Home/MySchedule)과 루트 AppStack(Profile/
 * ItineraryEditor/...)이 합쳐진 표면이다. 두 네비게이터를 오가며 navigate를
 * 호출하므로 여기에 모두 선언해 두어야 타입 검사가 동작한다.
 */
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
    transport?: string;
    pendingPlace?: any;
  };
  ItineraryView: {
    /** 편집 화면에서 넘어올 때만 채워진다. 목록에서 진입하면 화면이 직접 조회한다. */
    days?: Day[];
    tripName?: string;
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
  Profile: undefined;
  ThemeSettings: undefined;
  ChangePassword: undefined;
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
