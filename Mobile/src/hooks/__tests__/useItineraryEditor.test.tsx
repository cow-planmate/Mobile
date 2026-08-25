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

function HookHarness({ planId }: { planId: string }) {
  useItineraryEditor({ params: { planId } }, {});
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
});
