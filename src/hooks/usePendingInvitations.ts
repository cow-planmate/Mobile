import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { PendingInvitation, getPendingInvitations } from '../api/trips';
import { parseBackendError } from '../utils/errorHandler';
import { invalidatePlanCaches } from './planCache';

export const PENDING_INVITATIONS_QUERY_KEY = ['collaboration', 'pending'] as const;

const PENDING_INVITATIONS_STALE_MS = 60 * 1000;

export function usePendingInvitations(enabled = true) {
  return useQuery<PendingInvitation[]>({
    queryKey: PENDING_INVITATIONS_QUERY_KEY,
    queryFn: ({ signal }) => getPendingInvitations(signal),
    enabled,
    staleTime: PENDING_INVITATIONS_STALE_MS,
  });
}

export function invalidatePendingInvitations(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient
    .invalidateQueries({ queryKey: PENDING_INVITATIONS_QUERY_KEY })
    .then(() => undefined);
}

export async function removePendingInvitation(
  queryClient: QueryClient,
  requestId: number,
): Promise<void> {
  await queryClient.cancelQueries({
    queryKey: PENDING_INVITATIONS_QUERY_KEY,
  });
  queryClient.setQueryData<PendingInvitation[]>(
    PENDING_INVITATIONS_QUERY_KEY,
    prev => prev?.filter(request => request.requestId !== requestId),
  );
}

export function usePendingInvitationActions() {
  const queryClient = useQueryClient();

  return {
    invalidate: () => invalidatePendingInvitations(queryClient),
    remove: (requestId: number) =>
      removePendingInvitation(queryClient, requestId),
    removeIfProcessed: (requestId: number, error: unknown) =>
      removeProcessedInvitation(queryClient, requestId, error),
  };
}

export async function removeProcessedInvitation(
  queryClient: QueryClient,
  requestId: number,
  error: unknown,
): Promise<boolean> {
  if (parseBackendError(error).code !== 'COLLAB_005') return false;
  await removePendingInvitation(queryClient, requestId);
  await invalidatePlanCaches(queryClient);
  return true;
}
