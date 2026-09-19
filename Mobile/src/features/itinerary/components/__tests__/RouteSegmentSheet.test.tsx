import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Modal, Text, TouchableOpacity } from 'react-native';
import RouteSegmentSheet from '../RouteSegmentSheet';

describe('RouteSegmentSheet', () => {
  it('인라인 패널은 대중교통을 기본 선택하고 구간별 탭과 닫기를 연결한다', () => {
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <RouteSegmentSheet
          inline
          visible
          onClose={onClose}
          placeNames={['A', 'B', 'C']}
          data={{
            driving: {
              profile: 'driving',
              durations: [
                [0, 600],
                [null, 0, 900],
              ],
              distances: [
                [0, 2500],
                [null, 0, 4000],
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
    const tab = (label: string) =>
      tree!.root
        .findAllByType(TouchableOpacity)
        .find(node => node.props.accessibilityLabel === label)!;
    expect(tree!.root.findAllByType(Modal)).toHaveLength(0);
    expect(tab('1구간 대중교통').props.accessibilityState.selected).toBe(true);
    expect(JSON.stringify(tree!.toJSON())).toContain(
      '이 구간은 대중교통 경로가 없어요',
    );
    act(() => tab('1구간 자동차').props.onPress());
    expect(JSON.stringify(tree!.toJSON())).toContain('10분');
    expect(JSON.stringify(tree!.toJSON())).toContain('2.5km');
    expect(tab('2구간 대중교통').props.accessibilityState.selected).toBe(true);
    act(() => tab('1구간 도보').props.onPress());
    expect(JSON.stringify(tree!.toJSON())).toContain('정보 없음');
    act(() => tab('구간 정보 접기').props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });

  it('인라인 패널은 로딩과 조회 실패를 구분하고 실패 시 재시도한다', () => {
    const onRetry = jest.fn();
    const props = {
      inline: true,
      visible: true,
      onClose: jest.fn(),
      placeNames: ['A', 'B'],
      activeLaneKey: null,
      onToggleLane: jest.fn(),
      onRetry,
    };
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <RouteSegmentSheet {...props} isLoading isError={false} />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain(
      '구간 정보를 불러오는 중…',
    );
    expect(JSON.stringify(tree!.toJSON())).not.toContain(
      '대중교통 경로가 없어요',
    );
    act(() => {
      tree!.update(<RouteSegmentSheet {...props} isLoading={false} isError />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain(
      '구간 정보를 불러오지 못했어요.',
    );
    const button = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.onPress === onRetry)!;
    act(() => button.props.onPress());
    expect(onRetry).toHaveBeenCalledTimes(1);
    act(() => {
      tree!.update(
        <RouteSegmentSheet
          {...props}
          visible={false}
          isLoading={false}
          isError={false}
        />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
    act(() => tree!.unmount());
  });
  it('부분 실패를 표시하고 재시도를 연결한다', () => {
    const onRetry = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <RouteSegmentSheet
          visible
          onClose={jest.fn()}
          placeNames={['A', 'B']}
          data={{
            driving: null,
            foot: null,
            transit: [null],
            failures: { driving: true, foot: false, transit: [true] },
          }}
          isLoading={false}
          isError={false}
          activeLaneKey={null}
          onToggleLane={jest.fn()}
          onRetry={onRetry}
        />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('조회 실패');
    const button = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.onPress === onRetry)!;
    act(() => button.props.onPress());
    expect(onRetry).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
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
