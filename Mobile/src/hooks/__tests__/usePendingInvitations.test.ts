import { QueryClient } from '@tanstack/react-query';
import {
  PENDING_INVITATIONS_QUERY_KEY,
  removePendingInvitation,
  removeProcessedInvitation,
} from '../usePendingInvitations';
import { OWNED_PLAN_IDS_QUERY_KEY } from '../usePlanOwnership';

describe('removePendingInvitation', () => {
  it('clears a request processed elsewhere and refreshes membership without swallowing network errors', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(PENDING_INVITATIONS_QUERY_KEY, [{ requestId: 7 }]);
    queryClient.setQueryData(OWNED_PLAN_IDS_QUERY_KEY, { owned: [], editable: [] });
    expect(await removeProcessedInvitation(queryClient, 7, new Error('offline'))).toBe(false);
    expect(queryClient.getQueryData(PENDING_INVITATIONS_QUERY_KEY)).toEqual([{ requestId: 7 }]);
    expect(await removeProcessedInvitation(queryClient, 7, { response: { data: { code: 'COLLAB_005' } } })).toBe(true);
    expect(queryClient.getQueryData(PENDING_INVITATIONS_QUERY_KEY)).toEqual([]);
    expect(queryClient.getQueryState(OWNED_PLAN_IDS_QUERY_KEY)?.isInvalidated).toBe(true);
    queryClient.clear();
  });
  it('prevents an in-flight fetch from restoring a processed invitation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    let resolveFetch!: (value: unknown) => void;
    const fetchPromise = queryClient.fetchQuery({
      queryKey: PENDING_INVITATIONS_QUERY_KEY,
      queryFn: () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        }),
    });

    queryClient.setQueryData(PENDING_INVITATIONS_QUERY_KEY, [
      { requestId: 7 },
    ]);
    await removePendingInvitation(queryClient, 7);
    resolveFetch([{ requestId: 7 }]);
    await fetchPromise.catch(() => undefined);

    expect(queryClient.getQueryData(PENDING_INVITATIONS_QUERY_KEY)).toEqual([]);
    queryClient.clear();
  });
});
