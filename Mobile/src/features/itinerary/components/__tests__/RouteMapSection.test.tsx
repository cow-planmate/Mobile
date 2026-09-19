import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RouteMapSection from '../RouteMapSection';
import RouteSegmentSheet from '../RouteSegmentSheet';
import { PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import { useSegmentInfo } from '../../hooks/useRouteQueries';
import { fetchRouteTrip, RouteTripResponse } from '../../../../api/route';

jest.mock('../KakaoMapView', () => {
  const ReactLib = require('react');
  const move = jest.fn();
  const captured: { props?: Record<string, any> } = {};
  return {
    __esModule: true,
    default: ReactLib.forwardRef((props: Record<string, any>, ref: any) => {
      captured.props = props;
      ReactLib.useImperativeHandle(ref, () => ({
        moveToCurrentLocation: move,
      }));
      return null;
    }),
    __move: move,
    __captured: captured,
  };
});

jest.mock('../RouteSegmentSheet', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../hooks/useRouteQueries', () => ({
  pointsKey: (points: Array<{ lat: number; lng: number }>) =>
    points.map(point => `${point.lat},${point.lng}`).join('|'),
  useDirections: () => ({ data: undefined }),
  useSegmentInfo: jest.fn(() => ({ data: undefined })),
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

const mapMock = jest.requireMock('../KakaoMapView') as {
  __move: jest.Mock;
  __captured: { props?: Record<string, any> };
};

const places = [
  { id: '1', name: 'A', address: '', latitude: 37.1, longitude: 127.1 },
  { id: '2', name: 'B', address: '', latitude: 37.2, longitude: 127.2 },
  { id: '3', name: 'C', address: '', latitude: 37.3, longitude: 127.3 },
];

describe('RouteMapSection', () => {
  it('편집 지도는 구간 정보를 기본 조회하고 닫은 뒤에도 펼칠 수 있다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <RouteMapSection places={places} inlineSegments dayLabel="1일차" />,
      );
    });
    const findSummaryBar = () =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .find(node => node.props.accessibilityLabel === '구간 정보 펼치기');

    expect(useSegmentInfo).toHaveBeenLastCalledWith(expect.any(Array), true);
    expect(tree!.root.findByType(RouteSegmentSheet).props.visible).toBe(true);
    // 펼쳐 있는 동안에는 요약 바를 내지 않는다
    expect(findSummaryBar()).toBeUndefined();
    act(() => tree!.root.findByType(RouteSegmentSheet).props.onClose());
    expect(tree!.root.findByType(RouteSegmentSheet).props.visible).toBe(false);
    expect(JSON.stringify(tree!.toJSON())).toContain('구간별 이동');
    expect(useSegmentInfo).toHaveBeenLastCalledWith(expect.any(Array), true);
    act(() => findSummaryBar()!.props.onPress());
    expect(tree!.root.findByType(RouteSegmentSheet).props.visible).toBe(true);
    act(() => tree!.unmount());
  });

  it('기존 지도는 구간 정보를 열기 전에는 조회하지 않는다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<RouteMapSection places={places} />);
    });
    expect(useSegmentInfo).toHaveBeenLastCalledWith(expect.any(Array), false);
    expect(tree!.root.findByType(RouteSegmentSheet).props.visible).toBe(false);
    act(() => tree!.unmount());
  });
  it('장소 좌표가 바뀌면 진행 중인 순서 최적화를 취소한다', async () => {
    let resolveTrip: ((value: RouteTripResponse) => void) | undefined;
    mockFetchRouteTrip.mockImplementationOnce(
      () =>
        new Promise(resolve => {
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
      tree!.root
        .find(node => node.props.accessibilityLabel === '경로 순서 최적화')
        .props.onPress();
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

  it('내 위치 단추는 권한을 받은 뒤 지도를 옮기고 실패하면 안내한다', async () => {
    const originalOS = Platform.OS;
    Platform.OS = 'android';
    const requestSpy = jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
    mapMock.__move.mockClear();
    mockShowAlert.mockClear();

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<RouteMapSection places={places} inlineSegments />);
    });
    // 지도 조작 단추는 구간 정보를 펼쳐도 그대로 남는다
    const locateButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityLabel === '내 위치로 이동')!;

    await act(async () => {
      await locateButton.props.onPress();
    });
    expect(requestSpy).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    expect(mapMock.__move).toHaveBeenCalledTimes(1);
    expect(mockShowAlert).not.toHaveBeenCalled();

    act(() => mapMock.__captured.props!.onLocateResult(false));
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    );

    requestSpy.mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
    mockShowAlert.mockClear();
    await act(async () => {
      await locateButton.props.onPress();
    });
    expect(mapMock.__move).toHaveBeenCalledTimes(1);
    expect(mockShowAlert).toHaveBeenCalledTimes(1);

    act(() => tree!.unmount());
    requestSpy.mockRestore();
    Platform.OS = originalOS;
  });
});
