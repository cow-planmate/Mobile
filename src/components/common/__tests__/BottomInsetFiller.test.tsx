import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomInsetFiller from '../BottomInsetFiller';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

const mockedInsets = useSafeAreaInsets as jest.Mock;

const flatStyle = (tree: renderer.ReactTestRenderer) =>
  StyleSheet.flatten(tree.root.findByType(View).props.style);

describe('BottomInsetFiller', () => {
  const listeners: Record<string, () => void> = {};

  beforeEach(() => {
    mockedInsets.mockReturnValue({ top: 0, bottom: 24, left: 0, right: 0 });
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((
      event: string,
      cb: () => void,
    ) => {
      listeners[event] = cb;
      return { remove: jest.fn() };
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mount = () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<BottomInsetFiller />);
    });
    return tree;
  };

  it('아래 안전 여백만큼 흰색으로 채운다', () => {
    const tree = mount();
    expect(flatStyle(tree)).toEqual(
      expect.objectContaining({ height: 24, backgroundColor: '#FFFFFF' }),
    );
  });

  it('키보드가 올라오면 접고, 내려가면 다시 채운다', () => {
    const tree = mount();

    act(() => listeners.keyboardDidShow());
    expect(flatStyle(tree).height).toBe(0);

    act(() => listeners.keyboardDidHide());
    expect(flatStyle(tree).height).toBe(24);
  });
});
