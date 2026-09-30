import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PaxModal from '../PaxModal';

describe('PaxModal', () => {
  it('다시 열면 부모가 준 초기값으로 맞춘다', () => {
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

  it('확인 버튼 없이 +를 누른 즉시 반영한다', () => {
    const onConfirm = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PaxModal
          visible
          onClose={jest.fn()}
          onConfirm={onConfirm}
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
    expect(onConfirm).toHaveBeenCalledWith({ adults: 2, children: 0 });

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: '어린이 늘리기' })
        .props.onPress();
    });
    expect(onConfirm).toHaveBeenLastCalledWith({ adults: 2, children: 1 });

    act(() => tree!.unmount());
  });

  it('최소값에서는 줄이기가 막힌다', () => {
    const onConfirm = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PaxModal
          visible
          onClose={jest.fn()}
          onConfirm={onConfirm}
          initialAdults={1}
          initialChildren={0}
        />,
      );
    });

    expect(
      tree!.root.findByProps({ accessibilityLabel: '성인 줄이기' }).props
        .disabled,
    ).toBe(true);
    expect(
      tree!.root.findByProps({ accessibilityLabel: '어린이 줄이기' }).props
        .disabled,
    ).toBe(true);

    act(() => tree!.unmount());
  });
});
