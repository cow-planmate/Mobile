import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export const OWNED_PLAN_IDS_QUERY_KEY = ['ownedPlanIds'] as const;

async function fetchOwnedPlanIds(): Promise<string[]> {
  const { data } = await axios.get(resolveApiUrl('/api/user/profile'));

  return (data?.myPlans ?? [])
    .map((plan: any) => String(plan?.planId ?? '').toLowerCase())
    .filter(Boolean);
}

export function usePlanOwnership(planId?: string | null) {
  const { data, isLoading, isError } = useQuery({
    queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    queryFn: fetchOwnedPlanIds,

    staleTime: 1000 * 60 * 10,
  });

  const isOwner =
    !!planId &&
    !!data?.includes(String(planId).toLowerCase());

  return { isOwner, isLoading, isError };
}
