import { getChecklist } from '../src/api/checklist';
import { useChecklist } from '../src/features/itinerary/hooks/useChecklistQueries';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../src/api/checklist', () => ({
  getChecklist: jest.fn(),
}));

const mockedGetChecklist = getChecklist as jest.MockedFunction<typeof getChecklist>;
const mockUseQuery = useQuery as jest.Mock;
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
    options.queryFn();

    expect(mockedGetChecklist).toHaveBeenCalledWith(PLAN_ID, 'shared');
  });
});
