import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import UpdatePasswordModal from '../UpdatePasswordModal';
import UpdateThemeModal from '../UpdateThemeModal';
import { changePreferredThemes } from '../../../api/themes';

const mockShowAlert = jest.fn();
const mockGetQueryData = jest.fn();
const mockQueryClient = { getQueryData: mockGetQueryData };

jest.mock('../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

jest.mock('../../../api/themes', () => ({
  changePreferredThemes: jest.fn(),
}));

jest.mock('../ThemeSelector', () => ({
  __esModule: true,
  CATEGORY_MAP: {
    ATTRACTION: { id: 0 },
    ACCOMMODATION: { id: 1 },
    RESTAURANT: { id: 2 },
  },
  default: () => null,
}));

const mockChangePreferredThemes = changePreferredThemes as jest.MockedFunction<
  typeof changePreferredThemes
>;

describe('mutation modals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetQueryData.mockReturnValue({
      preferredThemes: [
        {
          category: 'ATTRACTION',
          preferredThemeId: 1,
          preferredThemeName: 'city',
        },
      ],
    });
  });

  it('submits a password change only once for same-render presses', async () => {
    let resolveConfirm: (() => void) | undefined;
    const pendingConfirm = new Promise<void>(resolve => {
      resolveConfirm = resolve;
    });
    const onConfirm = jest.fn(() => pendingConfirm);

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <UpdatePasswordModal
          visible
          onClose={jest.fn()}
          onConfirm={onConfirm}
        />,
      );
    });
    const inputs = tree!.root.findAllByType(TextInput);
    act(() => {
      inputs[0].props.onChangeText('Current1!');
      inputs[1].props.onChangeText('Changed1!');
      inputs[2].props.onChangeText('Changed1!');
    });
    const confirmButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityState?.disabled === false)!;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = confirmButton.props.onPress();
      second = confirmButton.props.onPress();
    });

    await act(async () => {
      resolveConfirm?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('saves preferred themes only once for same-render presses', async () => {
    let resolveSave: (() => void) | undefined;
    mockChangePreferredThemes.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveSave = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <UpdateThemeModal visible onClose={jest.fn()} onConfirm={jest.fn()} />,
      );
      await Promise.resolve();
    });
    const saveButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityState?.disabled === false)!;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = saveButton.props.onPress();
      second = saveButton.props.onPress();
    });

    await act(async () => {
      resolveSave?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockChangePreferredThemes).toHaveBeenCalledTimes(1);
  });
});
