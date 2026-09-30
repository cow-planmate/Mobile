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

export interface ProfilePlan {
  planId: string;
  planName: string;

  isShared: boolean;

  startDate?: string;
  endDate?: string;
}

export interface UserProfile {
  name: string;
  email: string;

  profileImageUrl: string;

  profilePublic: boolean;

  birthdate: string;
  gender: string;
  preferredThemes: PreferredThemeVO[];
  socialLogin: boolean;
  myPlans: ProfilePlan[];
}

export const USER_PROFILE_QUERY_KEY = ['userProfile'] as const;

const PLAN_DETAIL_CONCURRENCY = 5;

const GENDER_LABELS: Record<string, string> = {
  MALE: '남자',
  FEMALE: '여자',
  OTHER: '기타',
};

const formatDateStr = (dateStr: string): string => {
  const d = parseLocalDate(String(dateStr).substring(0, 10));
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

const withPlanDates = async (
  plan: ProfilePlan,
  queryClient: QueryClient,
  signal?: AbortSignal,
): Promise<ProfilePlan> => {
  try {

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
    if (signal?.aborted) throw e;
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

export function useUserProfile() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: ({ signal }) => fetchUserProfile(queryClient, signal),
  });
}
