import React from 'react';
import renderer, { act } from 'react-test-renderer';

import AirplaneLoading from '../AirplaneLoading';

describe('AirplaneLoading', () => {
  it('로딩 문구와 접근성 정보를 보여준다', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AirplaneLoading />);
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('일정 정보를 불러오는 중...');
    expect(json).toContain('PlanMate가 당신의 완벽한 여행을 그리고 있어요');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'progressbar' &&
          node.props.accessibilityLabel === '일정 정보를 불러오는 중',
      ).length,
    ).toBeGreaterThan(0);

    act(() => tree.unmount());
  });
});
