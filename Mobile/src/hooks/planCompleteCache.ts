import type { QueryClient } from '@tanstack/react-query';

/**
 * 일정 상세(`GET /api/plan/{planId}/complete`) 응답 공유 캐시.
 *
 * 이 응답은 일정 보기·편집·여행기 작성·프로필 목록이 각자 같은 URL로 따로
 * 받아 왔다. 특히 프로필은 카드에 표시할 시작·종료 날짜를 얻으려고 일정 수만큼
 * 이 요청을 낸다(N+1). 받아 온 쪽이 여기에 넣어 두면 프로필이 같은 일정을
 * 다시 부르지 않는다.
 *
 * 신선도가 중요한 화면(일정 보기·편집)은 읽지 않고 넣기만 한다 — 목록에 쓰는
 * 값은 날짜뿐이라 몇 분 지난 응답이어도 무방하지만, 편집 대상 데이터는 그렇지
 * 않기 때문이다.
 */

/** 일정 상세 응답 캐시 키 */
export const planCompleteKey = (planId: string) =>
  ['plan', planId, 'complete'] as const;

/** 프로필이 캐시된 응답을 재사용할 수 있는 시간(프로필 쿼리 staleTime과 동일) */
const REUSE_WINDOW_MS = 5 * 60 * 1000;

/** 받아 온 일정 상세 응답을 캐시에 넣는다. */
export function cachePlanComplete(
  queryClient: QueryClient,
  planId: string,
  data: unknown,
): void {
  if (!planId || !data) return;
  queryClient.setQueryData(planCompleteKey(planId), data);
}

/**
 * 캐시된 일정 상세 응답을 버린다.
 *
 * 편집 화면을 벗어날 때처럼 응답이 더 이상 현재 상태를 담고 있지 않은 시점에
 * 호출한다. 남겨 두면 프로필 목록이 편집 이전 날짜를 다시 보여줄 수 있다.
 */
export function dropPlanComplete(
  queryClient: QueryClient,
  planId: string,
): void {
  queryClient.removeQueries({ queryKey: planCompleteKey(planId) });
}

/** 재사용 가능한 일정 상세 응답. 없거나 오래됐으면 undefined. */
export function readCachedPlanComplete<T = unknown>(
  queryClient: QueryClient,
  planId: string,
): T | undefined {
  const state = queryClient.getQueryState(planCompleteKey(planId));
  if (!state?.data) return undefined;
  if (Date.now() - state.dataUpdatedAt > REUSE_WINDOW_MS) return undefined;
  return state.data as T;
}
