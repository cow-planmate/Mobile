import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import RouteSegmentSheet from '../RouteSegmentSheet';

describe('RouteSegmentSheet', () => {
  it('방문 순서와 구간별 시간·거리를 표시하고 누락된 경로도 렌더링한다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <RouteSegmentSheet
          visible
          onClose={jest.fn()}
          placeNames={['서울역', '경복궁', '북촌 한옥마을']}
          data={{
            driving: {
              profile: 'driving',
              durations: [
                [0, 600, null],
                [null, 0, null],
                [null, null, 0],
              ],
              distances: [
                [0, 2500, null],
                [null, 0, null],
                [null, null, 0],
              ],
            },
            foot: null,
            transit: [null, null],
          }}
          isLoading={false}
          isError={false}
          activeLaneKey={null}
          onToggleLane={jest.fn()}
        />,
      );
    });
    const labels = tree!.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(
      labels.filter(label =>
        ['서울역', '경복궁', '북촌 한옥마을'].includes(label),
      ),
    ).toEqual(['서울역', '경복궁', '북촌 한옥마을']);
    expect(labels).toContain('10분 · 2.5km');
    expect(labels).toContain('정보 없음');
    act(() => tree!.unmount());
  });
});
