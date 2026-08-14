import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { PendingInvitation, getPendingInvitations } from '../api/trips';

/**
 * 대기 중인 협업 요청 목록.
 *
 * 홈·커뮤니티·여행기 세 화면이 헤더에 같은 알림 배지를 띄운다. 예전에는 화면마다
 * 따로 조회해 상태를 들고 있어서, 탭을 옮길 때마다 같은 요청이 다시 나가고
 * 한 화면에서 수락한 결과가 다른 화면 배지에는 반영되지 않았다. 캐시 하나를
 * 공유해 두 문제를 함께 없앤다.
 */

export const PENDING_INVITATIONS_QUERY_KEY = ['collaboration', 'pending'] as const;

/**
 * 탭을 오갈 때마다 다시 부르지 않을 시간.
 *
 * 새 요청은 SSE·FCM이 알려 주고 그때 무효화하므로, 포커스마다 조회할 이유가 없다.
 */
const PENDING_INVITATIONS_STALE_MS = 60 * 1000;

export function usePendingInvitations(enabled = true) {
  return useQuery<PendingInvitation[]>({
    queryKey: PENDING_INVITATIONS_QUERY_KEY,
    queryFn: () => getPendingInvitations(),
    enabled,
    staleTime: PENDING_INVITATIONS_STALE_MS,
  });
}

/** 새 요청 알림을 받았을 때처럼 목록을 서버 기준으로 다시 맞춘다. */
export function invalidatePendingInvitations(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient
    .invalidateQueries({ queryKey: PENDING_INVITATIONS_QUERY_KEY })
    .then(() => undefined);
}

/**
 * 수락·거절한 요청을 목록에서 즉시 걷어낸다.
 *
 * 처리된 요청은 서버 목록에서도 사라지므로, 재조회를 기다리지 않고 지워도
 * 결과가 달라지지 않는다.
 */
export function removePendingInvitation(
  queryClient: QueryClient,
  requestId: number,
): void {
  queryClient.setQueryData<PendingInvitation[]>(
    PENDING_INVITATIONS_QUERY_KEY,
    prev => prev?.filter(request => request.requestId !== requestId),
  );
}

/** 화면에서 쓰기 편하도록 목록과 조작을 함께 돌려준다. */
export function usePendingInvitationActions() {
  const queryClient = useQueryClient();

  return {
    invalidate: () => invalidatePendingInvitations(queryClient),
    remove: (requestId: number) =>
      removePendingInvitation(queryClient, requestId),
  };
}
