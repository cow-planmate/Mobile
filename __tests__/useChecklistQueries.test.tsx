import { getChecklist } from '../src/api/checklist';
import {
  useChecklist,
  useToggleChecklistItem,
} from '../src/features/itinerary/hooks/useChecklistQueries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    isConnected: false,
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
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

  it('활성 공유 목록만 포그라운드에서 3초마다 조회한다', () => {
    useChecklist(PLAN_ID, 'shared');
    useChecklist(PLAN_ID, 'personal');
    useChecklist(PLAN_ID, 'shared', false);

    expect(mockUseQuery.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        enabled: true,
        refetchInterval: 3000,
        refetchIntervalInBackground: false,
      }),
    );
    expect(mockUseQuery.mock.calls[1][0].refetchInterval).toBe(false);
    expect(mockUseQuery.mock.calls[2][0].refetchInterval).toBe(false);
  });

  it('다시 열 때 재조회하고 취소 신호를 REST 조회에 전달한다', () => {
    useChecklist(PLAN_ID, 'shared');

    const options = mockUseQuery.mock.calls[0][0];
    const controller = new AbortController();
    options.queryFn({ signal: controller.signal });

    expect(options).toEqual(
      expect.objectContaining({
        queryKey: ['checklist', PLAN_ID, 'shared'],
        enabled: true,
        refetchOnMount: 'always',
      }),
    );
    expect(mockedGetChecklist).toHaveBeenCalledWith(
      PLAN_ID,
      'shared',
      controller.signal,
    );
  });
});

describe('useToggleChecklistItem', () => {
  const QUERY_KEY = ['checklist', PLAN_ID, 'shared'];
  const initialItems = [
    { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
  ];

  const mockQueryClient = () => {
    let data = initialItems;
    const queryClient = {
      cancelQueries: jest.fn().mockResolvedValue(undefined),
      getQueryData: jest.fn(() => data),
      setQueryData: jest.fn((_key, updater) => {
        data = typeof updater === 'function' ? updater(data) : updater;
        return data;
      }),
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
      replaceData: (next: typeof initialItems) => {
        data = next;
      },
    };
    mockUseQueryClient.mockReturnValue(queryClient);
    return queryClient;
  };

  const toggleOptions = () => mockUseMutation.mock.calls[0][0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('완료 결과와 관계없이 서버 목록으로 다시 맞춘다', async () => {
    const queryClient = mockQueryClient();
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    expect(queryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: QUERY_KEY,
    });

    options.onSettled(undefined, null, { itemId: 1, isChecked: true }, context);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: QUERY_KEY,
    });
  });

  it('실패 전까지 캐시가 그대로면 낙관적 변경을 되돌린다', async () => {
    const queryClient = mockQueryClient();
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    options.onError(new Error('boom'), { itemId: 1, isChecked: true }, context);

    expect(queryClient.setQueryData).toHaveBeenLastCalledWith(
      QUERY_KEY,
      context.previousItems,
    );
  });

  it('실패 전에 원격 상태가 들어오면 이전 스냅샷으로 덮지 않는다', async () => {
    const queryClient = mockQueryClient();
    useToggleChecklistItem(PLAN_ID, 'shared');
    const options = toggleOptions();

    const context = await options.onMutate({ itemId: 1, isChecked: true });
    const remoteItems = [
      { itemId: 1, content: '새 여권', isChecked: true, sortOrder: 0 },
    ];
    queryClient.replaceData(remoteItems);
    options.onError(new Error('boom'), { itemId: 1, isChecked: true }, context);

    expect(queryClient.getQueryData()).toBe(remoteItems);
    expect(queryClient.setQueryData).toHaveBeenCalledTimes(1);
  });
});
