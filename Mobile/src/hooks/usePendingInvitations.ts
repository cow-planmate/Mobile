import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { PendingInvitation, getPendingInvitations } from '../api/trips';

export const PENDING_INVITATIONS_QUERY_KEY = ['collaboration', 'pending'] as const;

const PENDING_INVITATIONS_STALE_MS = 60 * 1000;

export function usePendingInvitations(enabled = true) {
  return useQuery<PendingInvitation[]>({
    queryKey: PENDING_INVITATIONS_QUERY_KEY,
    queryFn: () => getPendingInvitations(),
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

export function removePendingInvitation(
  queryClient: QueryClient,
  requestId: number,
): void {
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
  };
}
