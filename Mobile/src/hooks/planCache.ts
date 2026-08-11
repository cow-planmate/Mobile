import type { QueryClient } from '@tanstack/react-query';
import { USER_PROFILE_QUERY_KEY } from './useUserProfile';
import { OWNED_PLAN_IDS_QUERY_KEY } from './usePlanOwnership';

/**
 * 일정 목록·소유권 캐시를 한 번에 무효화한다.
 *
 * 일정을 만들거나 지우거나, 초대를 수락해 편집 권한을 얻으면 프로필 응답
 * (myPlans/editablePlans)이 바뀐다. 이 응답 하나에서 두 캐시가 파생된다.
 * - USER_PROFILE_QUERY_KEY : 내 일정 목록 화면
 * - OWNED_PLAN_IDS_QUERY_KEY: 소유자 판정(usePlanOwnership)
 *
 * 예전에는 호출부마다 `['myPlans']`를 무효화했는데, 그 키로 등록된 쿼리가
 * 없어서 아무것도 무효화되지 않았다. 특히 소유권 캐시는 staleTime이 10분이라
 * 새로 만든 일정에서도 한동안 소유자가 아닌 것으로 판정됐다.
 * 키를 직접 쓰지 않고 이 함수를 거치게 해 같은 실수를 반복하지 않는다.
 */
export function invalidatePlanCaches(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: OWNED_PLAN_IDS_QUERY_KEY }),
  ]).then(() => undefined);
}
