import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import BackTopBar, { TOP_BAR_METRICS } from '../BackTopBar';

describe('BackTopBar', () => {
  it('keeps the title and back action at the shared header size', () => {
    const onBack = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BackTopBar title="여행기" onBack={onBack} />,
      );
    });

    const backButton = tree!.root.findByProps({
      accessibilityLabel: '뒤로 가기',
    });
    expect(backButton.props.style).toEqual(
      expect.objectContaining({
        width: TOP_BAR_METRICS.actionSize,
        height: TOP_BAR_METRICS.actionSize,
      }),
    );
    expect(tree!.root.findByType(Text).props.children).toBe('여행기');

    act(() => backButton.props.onPress());
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('disables back navigation while a submitting screen is locked', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BackTopBar title="게시글 수정" onBack={jest.fn()} backDisabled />,
      );
    });

    expect(
      tree!.root.findByProps({ accessibilityLabel: '뒤로 가기' }).props.disabled,
    ).toBe(true);
  });
});
