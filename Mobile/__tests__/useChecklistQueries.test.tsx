import { getChecklist } from '../src/api/checklist';
import {
  useChecklist,
  useToggleChecklistItem,
} from '../src/features/itinerary/hooks/useChecklistQueries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const mockChecklistWebSocket = {
  isConnected: false,
  sendMessage: jest.fn(),
  subscribeToMessages: jest.fn(),
  unsubscribeFromMessages: jest.fn(),
};

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => mockChecklistWebSocket,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('../src/api/checklist', () => ({
  getChecklist: jest.fn(),
  editChecklistItemChecked: jest.fn(),
  reorderChecklistItems: jest.fn(),
}));

const mockedGetChecklist = getChecklist as jest.MockedFunction<typeof getChecklist>;
const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const PLAN_ID = '3f6c1b7e-0000-4000-8000-000000000001';

describe('useChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('캐시가 최신 상태여도 시트를 다시 열면 목록을 다시 조회하도록 설정한다', () => {
    useChecklist(PLAN_ID, 'shared');

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['checklist', PLAN_ID, 'shared'],
        enabled: true,
        refetchOnMount: 'always',
      }),
    );

    const options = mockUseQuery.mock.calls[0][0];
    const controller = new AbortController();
    options.queryFn({ signal: controller.signal });

    expect(mockedGetChecklist).toHaveBeenCalledWith(
      PLAN_ID,
      'shared',
      controller.signal,
    );
  });
});

describe('useToggleChecklistItem', () => {
  const QUERY_KEY = ['checklist', PLAN_ID, 'shared'];

  const mockQueryClient = (fetchStatus: 'fetching' | 'idle') => {
    const queryClient = {
      cancelQueries: jest.fn().mockResolvedValue(undefined),
      getQueryState: jest.fn().mockReturnValue({ fetchStatus }),
      getQueryData: jest.fn().mockReturnValue([
        { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
      ]),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    };
    mockUseQueryClient.mockReturnValue(queryClient);
    return queryClient;
  };

  const toggleOptions = () => mockUseMutation.mock.calls[0][0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('진행 중이던 조회를 끊었으면 성공 후 목록을 다시 맞춘다', async () => {
    const queryClient = mockQueryClient('fetching');
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    expect(queryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: QUERY_KEY,
    });
    expect(context.cancelledFetch).toBe(true);

    options.onSettled(undefined, null, { itemId: 1, isChecked: true }, context);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: QUERY_KEY,
    });
  });

  it('끊은 조회가 없으면 성공 후 재조회하지 않는다', async () => {
    const queryClient = mockQueryClient('idle');
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    expect(context.cancelledFetch).toBe(false);

    options.onSettled(undefined, null, { itemId: 1, isChecked: true }, context);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('실패하면 직전 목록으로 되돌리고 재조회한다', async () => {
    const queryClient = mockQueryClient('idle');
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    options.onError(new Error('boom'), { itemId: 1, isChecked: true }, context);
    expect(queryClient.setQueryData).toHaveBeenLastCalledWith(
      QUERY_KEY,
      context.previousItems,
    );

    options.onSettled(
      undefined,
      new Error('boom'),
      { itemId: 1, isChecked: true },
      context,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: QUERY_KEY,
    });
  });
});
