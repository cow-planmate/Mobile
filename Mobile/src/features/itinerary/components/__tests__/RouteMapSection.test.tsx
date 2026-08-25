import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RouteMapSection from '../RouteMapSection';
import { fetchRouteTrip, RouteTripResponse } from '../../../../api/route';

jest.mock('../KakaoMapView', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../RouteSegmentSheet', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../hooks/useRouteQueries', () => ({
  pointsKey: (points: Array<{ lat: number; lng: number }>) =>
    points.map(point => `${point.lat},${point.lng}`).join('|'),
  useDirections: () => ({ data: undefined }),
  useSegmentInfo: () => ({ data: undefined }),
  useTransitLane: () => ({ data: undefined }),
}));

jest.mock('../../../../api/route', () => ({
  fetchRouteTrip: jest.fn(),
  isRouteFallback: () => true,
}));

const mockShowAlert = jest.fn();

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

const mockFetchRouteTrip = fetchRouteTrip as jest.MockedFunction<
  typeof fetchRouteTrip
>;

const places = [
  { id: '1', name: 'A', address: '', latitude: 37.1, longitude: 127.1 },
  { id: '2', name: 'B', address: '', latitude: 37.2, longitude: 127.2 },
  { id: '3', name: 'C', address: '', latitude: 37.3, longitude: 127.3 },
];

describe('RouteMapSection', () => {
  it('장소 좌표가 바뀌면 진행 중인 순서 최적화를 취소한다', async () => {
    let resolveTrip: ((value: RouteTripResponse) => void) | undefined;
    mockFetchRouteTrip.mockImplementationOnce(
      () => new Promise(resolve => {
        resolveTrip = resolve;
      }),
    );
    const onApplyOptimizedOrder = jest.fn();

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <RouteMapSection
          places={places}
          onApplyOptimizedOrder={onApplyOptimizedOrder}
        />,
      );
    });

    act(() => {
      tree!.root.find(
        node => node.props.accessibilityLabel === '경로 순서 최적화',
      ).props.onPress();
    });
    const signal = mockFetchRouteTrip.mock.calls[0][3];

    act(() => {
      tree!.update(
        <RouteMapSection
          places={[...places.slice(0, 2), { ...places[2], latitude: 38 }]}
          onApplyOptimizedOrder={onApplyOptimizedOrder}
        />,
      );
    });
    expect(signal?.aborted).toBe(true);

    await act(async () => {
      resolveTrip?.({
        visitOrder: [0, 1, 2],
        totalDistance: 0,
        totalDuration: 0,
        legs: [],
      });
    });
    expect(onApplyOptimizedOrder).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
    act(() => tree!.unmount());
  });
});
