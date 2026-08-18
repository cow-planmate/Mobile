import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export const OWNED_PLAN_IDS_QUERY_KEY = ['ownedPlanIds'] as const;

export interface PlanMembership {
  owned: string[];
  editable: string[];
}

const toPlanIds = (plans: unknown): string[] =>
  (Array.isArray(plans) ? plans : [])
    .map((plan: any) => String(plan?.planId ?? '').toLowerCase())
    .filter(Boolean);

/**
 * 서버의 myPlans는 OWNER, editablePlans는 EDITOR 역할이다. 둘의 합집합이
 * 백엔드 planAccessValidator.validateMember가 통과시키는 범위와 정확히 같다.
 */
export function selectPlanMembership(profile: unknown): PlanMembership {
  const data = profile as { myPlans?: unknown; editablePlans?: unknown } | null;
  return {
    owned: toPlanIds(data?.myPlans),
    editable: toPlanIds(data?.editablePlans),
  };
}

async function fetchPlanMembership(): Promise<PlanMembership> {
  const { data } = await axios.get(resolveApiUrl('/api/user/profile'));
  return selectPlanMembership(data);
}

export function hasPlanRole(
  ids: string[] | undefined,
  planId?: string | null,
): boolean {
  if (!planId) return false;
  return !!ids?.includes(String(planId).toLowerCase());
}

export function usePlanOwnership(planId?: string | null) {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    queryFn: fetchPlanMembership,

    staleTime: 1000 * 60 * 10,
  });

  const isOwner = hasPlanRole(data?.owned, planId);
  const isEditor = hasPlanRole(data?.editable, planId);

  return {
    isOwner,
    isEditor,
    canEdit: isOwner || isEditor,

    // 갱신 중에는 직전 목록이 그대로 남아 있어 "권한 없음" 판정을 내리면 안 된다.
    isResolved: !isLoading && !isFetching && !isError,
    isLoading,
    isError,
  };
}
