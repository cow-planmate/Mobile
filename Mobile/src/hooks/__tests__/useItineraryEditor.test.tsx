import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import { useItineraryEditor } from '../useItineraryEditor';

const mockResetItinerary = jest.fn();

jest.mock('../../contexts/ItineraryContext', () => ({
  useItinerary: () => ({
    days: [],
    setDays: jest.fn(),
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
});
