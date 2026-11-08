import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Svg, { Circle } from 'react-native-svg';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  const render = async (element: React.ReactElement) => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(element);
    });
    return renderer;
  };

  it('큰 것은 지름 40, 작은 것은 지름 20으로 그린다', async () => {
    const large = await render(<LoadingSpinner />);
    const small = await render(<LoadingSpinner size="small" />);

    expect(large.root.findByType(Svg).props.width).toBe(40);
    expect(small.root.findByType(Svg).props.width).toBe(20);
  });

  it('호 색을 바꿀 수 있고, 기본은 앱 파랑이다', async () => {
    const custom = await render(<LoadingSpinner color="#FF0000" />);
    const basic = await render(<LoadingSpinner />);

    const strokesOf = (r: ReactTestRenderer.ReactTestRenderer) =>
      r.root.findAllByType(Circle).map(c => c.props.stroke);

    expect(strokesOf(custom)).toContain('#FF0000');
    expect(strokesOf(basic)).toContain('#1344FF');
  });
});
