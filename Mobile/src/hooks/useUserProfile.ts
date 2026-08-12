import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import { parseLocalDate } from '../utils/timeUtils';
import { mapWithConcurrency } from '../utils/concurrency';
import { PreferredThemeVO } from '../api/themes';
import {
  cachePlanComplete,
  readCachedPlanComplete,
} from './planCompleteCache';

/** 프로필 응답의 일정 항목. 서버는 planId/planName만 내려준다. */
export interface ProfilePlan {
  planId: string;
  planName: string;
  /** 내 일정이 아니라 편집 권한만 받은 일정인지 */
  isShared: boolean;
  /** 'YYYY.MM.DD'. 서버 프로필 응답에 없어 일정 상세를 별도로 조회해 채운다. */
  startDate?: string;
  endDate?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  /** 서버에 올린 프로필 이미지. 없으면 앱이 Gravatar로 대체한다. */
  profileImageUrl: string;
  /** 다른 사용자에게 프로필을 공개할지 */
  profilePublic: boolean;
  /** 'YYYY-MM-DD'. 미설정이면 빈 문자열. 표시용 나이는 birthdate에서 파생한다. */
  birthdate: string;
  gender: string;
  preferredThemes: PreferredThemeVO[];
  socialLogin: boolean;
  myPlans: ProfilePlan[];
}

export const USER_PROFILE_QUERY_KEY = ['userProfile'] as const;

/**
 * 일정 상세를 동시에 조회할 최대 개수.
 *
 * 서버 프로필 응답(SimplePlanDto)에는 날짜가 없어 일정마다 상세를 한 번씩 더 불러야 한다.
 * 일정 수만큼 한꺼번에 띄우면 모바일 회선에서 요청이 몰려 첫 렌더가 오히려 늦어지므로
 * 동시 실행 수를 제한한다.
 */
const PLAN_DETAIL_CONCURRENCY = 5;

const GENDER_LABELS: Record<string, string> = {
  MALE: '남자',
  FEMALE: '여자',
  OTHER: '기타',
};

/**
 * 서버 LocalDate('YYYY-MM-DD')를 'YYYY.MM.DD' 표시 문자열로 바꾼다.
 * new Date(문자열)은 UTC 자정으로 해석되어 UTC보다 이른 타임존에서 하루가 밀린다.
 */
const formatDateStr = (dateStr: string): string => {
  const d = parseLocalDate(String(dateStr).substring(0, 10));
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

/** 일정 상세에서 시작·종료 날짜만 뽑아 채워 넣는다. 실패하면 원본을 그대로 둔다. */
const withPlanDates = async (
  plan: ProfilePlan,
  queryClient: QueryClient,
  signal?: AbortSignal,
): Promise<ProfilePlan> => {
  try {
    // 일정 보기·편집이 이미 받아 둔 응답이 있으면 그대로 쓴다. 목록에 필요한 건
    // 날짜 두 개뿐이라 몇 분 지난 값이어도 무방하다(일정 수만큼 나가던 요청을 줄인다).
    const cached = readCachedPlanComplete<any>(queryClient, plan.planId);
    const data =
      cached ??
      (
        await axios.get(resolveApiUrl(`/api/plan/${plan.planId}/complete`), {
          signal,
        })
      ).data;

    if (!cached && data) {
      cachePlanComplete(queryClient, plan.planId, data);
    }

    const timetables = data?.timetables;
    if (!timetables || timetables.length === 0) {
      return plan;
    }

    // 'YYYY-MM-DD'는 사전순 비교가 곧 날짜순이라 Date로 만들 필요가 없다.
    const dateKey = (tt: any) => String(tt?.date ?? '').substring(0, 10);
    const sorted = [...timetables].sort((a: any, b: any) =>
      dateKey(a).localeCompare(dateKey(b)),
    );

    return {
      ...plan,
      startDate: formatDateStr(sorted[0].date),
      endDate: formatDateStr(sorted[sorted.length - 1].date),
    };
  } catch (e) {
    if (__DEV__) {
      console.log(`Failed to fetch dates for plan ${plan.planId}:`, e);
    }
    return plan;
  }
};

const fetchUserProfile = async (
  queryClient: QueryClient,
  signal?: AbortSignal,
): Promise<UserProfile> => {
  const { data } = await axios.get(resolveApiUrl('/api/user/profile'), {
    signal,
  });

  const plans: ProfilePlan[] = [
    ...(data.myPlans || []).map((p: any) => ({ ...p, isShared: false })),
    ...(data.editablePlans || []).map((p: any) => ({ ...p, isShared: true })),
  ];

  const plansWithDates = await mapWithConcurrency(
    plans,
    PLAN_DETAIL_CONCURRENCY,
    plan => withPlanDates(plan, queryClient, signal),
  );

  return {
    name: data.nickname || '이름 없음',
    email: data.email || '',
    profileImageUrl: data.profileImageUrl || '',
    profilePublic: data.profilePublic ?? false,
    birthdate: data.birthdate ? String(data.birthdate).substring(0, 10) : '',
    gender: GENDER_LABELS[data.gender] ?? '미설정',
    preferredThemes: data.preferredThemes || [],
    socialLogin: data.isSocialLogin || false,
    myPlans: plansWithDates,
  };
};

/**
 * 프로필 조회 훅.
 *
 * 화면 포커스마다 직접 조회하는 대신 캐시를 쓴다. 일정 하나당 상세 조회가
 * 한 번씩 더 나가므로(N+1) 재진입할 때마다 다시 부르면 비용이 크다.
 * 일정 생성·저장 시에는 usePlanQueries가 이 키를 무효화한다.
 */
export function useUserProfile() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: ({ signal }) => fetchUserProfile(queryClient, signal),
  });
}
