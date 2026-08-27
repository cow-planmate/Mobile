import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ChangePasswordScreen from '../ChangePasswordScreen';
import { changePassword } from '../../../../api/auth';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('../../../../api/auth', () => ({
  changePassword: jest.fn(),
}));

jest.mock('../ChangePasswordScreen.view', () => {
  const ReactModule = require('react');
  return {
    ChangePasswordScreenView: (props: unknown) =>
      ReactModule.createElement('ChangePasswordScreenView', props),
  };
});

const mockChangePassword = changePassword as jest.MockedFunction<
  typeof changePassword
>;

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('같은 렌더에서 제출을 연속 실행해도 변경 요청은 한 번만 보낸다', async () => {
    let resolveChange: (() => void) | undefined;
    mockChangePassword.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveChange = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ChangePasswordScreen />);
    });

    let props = tree!.root.findByType('ChangePasswordScreenView' as any).props;
    act(() => {
      props.onChange('currentPassword', 'Current1!');
      props.onChange('newPassword', 'Changed1!');
      props.onChange('confirmPassword', 'Changed1!');
    });
    props = tree!.root.findByType('ChangePasswordScreenView' as any).props;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = props.onSubmit();
      second = props.onSubmit();
    });

    await act(async () => {
      resolveChange?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockChangePassword).toHaveBeenCalledTimes(1);
  });
});
