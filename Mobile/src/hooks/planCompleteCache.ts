import type { QueryClient } from '@tanstack/react-query';

export const planCompleteKey = (planId: string) =>
  ['plan', planId, 'complete'] as const;

const REUSE_WINDOW_MS = 5 * 60 * 1000;

export function cachePlanComplete(
  queryClient: QueryClient,
  planId: string,
  data: unknown,
): void {
  if (!planId || !data) return;
  queryClient.setQueryData(planCompleteKey(planId), data);
}

export function dropPlanComplete(
  queryClient: QueryClient,
  planId: string,
): void {
  queryClient.removeQueries({ queryKey: planCompleteKey(planId) });
}

export function readCachedPlanComplete<T = unknown>(
  queryClient: QueryClient,
  planId: string,
): T | undefined {
  const state = queryClient.getQueryState(planCompleteKey(planId));
  if (!state?.data) return undefined;
  if (Date.now() - state.dataUpdatedAt > REUSE_WINDOW_MS) return undefined;
  return state.data as T;
}
