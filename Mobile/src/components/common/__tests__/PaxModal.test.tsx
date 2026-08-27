import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PaxModal from '../PaxModal';

describe('PaxModal', () => {
  it('확인하지 않고 닫은 변경값은 다시 열 때 초기값으로 되돌린다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PaxModal
          visible
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          initialAdults={1}
          initialChildren={0}
        />,
      );
    });

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: '성인 늘리기' })
        .props.onPress();
    });
    expect(
      tree!.root.findAllByProps({ accessibilityLabel: '2명' }).length,
    ).toBeGreaterThan(0);

    act(() => {
      tree!.update(
        <PaxModal
          visible={false}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          initialAdults={1}
          initialChildren={0}
        />,
      );
    });
    act(() => {
      tree!.update(
        <PaxModal
          visible
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          initialAdults={1}
          initialChildren={0}
        />,
      );
    });

    expect(
      tree!.root.findAllByProps({ accessibilityLabel: '2명' }),
    ).toHaveLength(0);
    expect(
      tree!.root.findAllByProps({ accessibilityLabel: '1명' }).length,
    ).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });
});
