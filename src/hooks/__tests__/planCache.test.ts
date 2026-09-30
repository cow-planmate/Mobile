jest.mock('../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { QueryClient } from '@tanstack/react-query';
import { invalidatePlanCaches } from '../planCache';
import { USER_PROFILE_QUERY_KEY } from '../useUserProfile';
import { OWNED_PLAN_IDS_QUERY_KEY } from '../usePlanOwnership';

describe('invalidatePlanCaches', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('프로필과 소유권 캐시를 모두 무효화한다', async () => {
    const spy = jest.spyOn(queryClient, 'invalidateQueries');

    await invalidatePlanCaches(queryClient);

    const invalidatedKeys = spy.mock.calls.map(call => call[0]?.queryKey);
    expect(invalidatedKeys).toContainEqual(USER_PROFILE_QUERY_KEY);
    expect(invalidatedKeys).toContainEqual(OWNED_PLAN_IDS_QUERY_KEY);
  });

  it('실제로 등록된 쿼리를 stale로 만든다', async () => {

    queryClient.setQueryData(USER_PROFILE_QUERY_KEY, { name: 'me' });
    queryClient.setQueryData(OWNED_PLAN_IDS_QUERY_KEY, ['plan-1']);

    await invalidatePlanCaches(queryClient);

    expect(
      queryClient.getQueryState(USER_PROFILE_QUERY_KEY)?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(OWNED_PLAN_IDS_QUERY_KEY)?.isInvalidated,
    ).toBe(true);
  });
});
