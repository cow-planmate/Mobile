import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PlanMapModal from '../PlanMapModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

jest.mock('../RouteMapSection', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../KakaoMapView', () => ({
  __esModule: true,
  default: () => null,
}));

describe('PlanMapModal', () => {
  const places = [
    { id: '1', name: '장소 1', address: '', latitude: 37.5, longitude: 127.0 },
    { id: '2', name: '장소 2', address: '', latitude: 37.6, longitude: 127.1 },
  ];

  it('모달 내부를 GestureHandlerRootView로 감싸 제스처 컨텍스트를 제공한다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PlanMapModal
          visible
          onClose={jest.fn()}
          places={places}
          inlineSegments
        />,
      );
    });

    const rootViews = tree!.root.findAllByType(GestureHandlerRootView);
    expect(rootViews.length).toBeGreaterThanOrEqual(1);

    act(() => tree!.unmount());
  });
});
