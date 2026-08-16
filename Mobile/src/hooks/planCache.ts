import type { QueryClient } from '@tanstack/react-query';
import { USER_PROFILE_QUERY_KEY } from './useUserProfile';
import { OWNED_PLAN_IDS_QUERY_KEY } from './usePlanOwnership';

export function invalidatePlanCaches(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: OWNED_PLAN_IDS_QUERY_KEY }),
  ]).then(() => undefined);
}
