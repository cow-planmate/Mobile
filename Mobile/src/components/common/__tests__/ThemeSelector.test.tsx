import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import ThemeSelector from '../ThemeSelector';
import {
  getPreferredThemes,
  PreferredThemeVO,
} from '../../../api/themes';

jest.mock('../../../api/themes', () => ({
  getPreferredThemes: jest.fn(),
}));

const mockShowAlert = jest.fn();

jest.mock('../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

const mockGetPreferredThemes = getPreferredThemes as jest.MockedFunction<
  typeof getPreferredThemes
>;

describe('ThemeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('마지막 단계 건너뛰기는 기존 선택을 비운 결과를 전달한다', async () => {
    const theme = {
      preferredThemeId: 1,
      preferredThemeName: '박물관',
      category: 'ATTRACTION' as const,
    };
    mockGetPreferredThemes.mockResolvedValue({ preferredThemes: [theme] });
    const onComplete = jest.fn();

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ThemeSelector
          visible
          onClose={jest.fn()}
          onComplete={onComplete}
          initialSelections={{ 0: [theme] }}
        />,
      );
      await Promise.resolve();
    });

    const skipButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node =>
        node
          .findAllByType(Text)
          .some(text => text.props.children === '건너뛰기'),
      );

    act(() => {
      skipButton!.props.onPress();
    });

    expect(onComplete).toHaveBeenCalledWith({ 0: [] });
    act(() => tree!.unmount());
  });

  it('모달이 닫히면 테마 목록 조회를 취소한다', async () => {
    let resolveThemes:
      | ((value: { preferredThemes: PreferredThemeVO[] }) => void)
      | undefined;
    mockGetPreferredThemes.mockImplementationOnce(
      () => new Promise(resolve => {
        resolveThemes = resolve;
      }),
    );

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ThemeSelector
          visible
          onClose={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    const signal = mockGetPreferredThemes.mock.calls[0][0];

    act(() => {
      tree!.update(
        <ThemeSelector
          visible={false}
          onClose={jest.fn()}
          onComplete={jest.fn()}
        />,
      );
    });
    expect(signal?.aborted).toBe(true);

    await act(async () => {
      resolveThemes?.({ preferredThemes: [] });
    });
    act(() => tree!.unmount());
  });
});
