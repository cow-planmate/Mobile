import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import { useItineraryEditor } from '../useItineraryEditor';

const mockResetItinerary = jest.fn();
const mockSetDays = jest.fn();

jest.mock('../../contexts/ItineraryContext', () => ({
  useItinerary: () => ({
    days: [],
    setDays: mockSetDays,
    resetItinerary: mockResetItinerary,
    deletePlaceFromDay: jest.fn(),
    addPlaceToDay: jest.fn(),
    updatePlaceTimes: jest.fn(),
    lastAddedPlaceId: null,
    setLastAddedPlaceId: jest.fn(),
  }),
  isFetchAtLeastAsComplete: jest.fn(() => true),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ removeQueries: jest.fn() }),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
  isCancel: jest.fn(() => false),
}));

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

const mockedAxios = axios as jest.Mocked<typeof axios>;

let hookResult: ReturnType<typeof useItineraryEditor>;

function HookHarness({
  planId,
  startDate,
  endDate,
}: {
  planId: string;
  startDate?: string;
  endDate?: string;
}) {
  hookResult = useItineraryEditor({ params: { planId, startDate, endDate } }, {});
  return null;
}

describe('useItineraryEditor plan fetch lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation(() => new Promise(() => undefined));
  });

  it('플랜이 바뀌면 이전 상세 조회를 취소한다', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HookHarness planId="plan-1" />);
      await Promise.resolve();
    });

    const firstSignal = mockedAxios.get.mock.calls[0][1]?.signal;
    expect(firstSignal?.aborted).toBe(false);

    await act(async () => {
      tree!.update(<HookHarness planId="plan-2" />);
      await Promise.resolve();
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(mockedAxios.get.mock.calls[1][0]).toContain('/api/plan/plan-2/complete');

    const secondSignal = mockedAxios.get.mock.calls[1][1]?.signal;
    await act(async () => tree!.unmount());
    expect(secondSignal?.aborted).toBe(true);
  });

  it('같은 플랜의 시작일이 바뀌면 다시 조회하고 초기 로딩을 끝낸다', async () => {
    mockedAxios.get
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValueOnce({
        data: { planFrame: {}, placeBlocks: [], timetables: [] },
      } as never);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <HookHarness
          planId="plan-1"
          startDate="2026-08-27"
          endDate="2026-08-29"
        />,
      );
      await Promise.resolve();
    });

    await act(async () => {
      tree!.update(
        <HookHarness
          planId="plan-1"
          startDate="2026-08-28"
          endDate="2026-08-29"
        />,
      );
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(hookResult.isInitialPlanLoading).toBe(false);
    await act(async () => tree!.unmount());
  });

  /** setDays에 건네진 마지막 갱신을 실제로 돌려 하루 목록을 꺼낸다. */
  const lastDays = () => {
    const updater = mockSetDays.mock.calls[mockSetDays.mock.calls.length - 1][0];
    return typeof updater === 'function' ? updater([]) : updater;
  };

  const loadPlanWith = async (block: Record<string, unknown>) => {
    mockedAxios.get.mockResolvedValue({
      data: {
        planFrame: {},
        timetables: [
          {
            timetableId: 1,
            date: '2026-09-07',
            timeTableStartTime: '09:00:00',
            timeTableEndTime: '20:00:00',
          },
        ],
        placeBlocks: [{ blockId: 7, timeTableId: 1, ...block }],
      },
    } as never);

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <HookHarness
          planId="plan-1"
          startDate="2026-09-07"
          endDate="2026-09-07"
        />,
      );
      await Promise.resolve();
    });
    return tree;
  };

  it('시간표 밖으로 나간 블록만큼 하루 범위를 넓힌다', async () => {
    // AI 도우미는 시간표 범위를 모르는 채로 시간을 정한다. 넓히지 않으면
    // 그릴 자리가 없어 블록이 통째로 사라진다.
    const tree = await loadPlanWith({
      placeName: '야시장',
      blockStartTime: '21:10:00',
      blockEndTime: '22:30:00',
    });

    const days = lastDays();
    expect(days[0].startTime).toBe('09:00:00');
    expect(days[0].endTime).toBe('23:00:00');
    await act(async () => tree.unmount());
  });

  it('범위 안에 있는 블록은 하루를 좁히지 않는다', async () => {
    const tree = await loadPlanWith({
      placeName: '점심',
      blockStartTime: '12:00:00',
      blockEndTime: '13:00:00',
    });

    // 사람이 정해 둔 범위는 장소가 없어도 그대로 둔다.
    const days = lastDays();
    expect(days[0].startTime).toBe('09:00:00');
    expect(days[0].endTime).toBe('20:00:00');
    await act(async () => tree.unmount());
  });
});
