import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import ForgotPasswordScreen from '../src/features/auth/screens/ForgotPasswordScreen';

const mockViewProps: { current: any } = { current: null };

jest.mock('../src/features/auth/screens/ForgotPasswordScreen.view', () => ({
  ForgotPasswordScreenView: (props: unknown) => {
    mockViewProps.current = props;
    return null;
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('이메일 수정 후 이전 인증번호 확인 응답을 무시한다', async () => {
    let resolveVerification: (value: unknown) => void = () => undefined;
    const verificationPromise = new Promise(resolve => {
      resolveVerification = resolve;
    });
    mockedAxios.post
      .mockResolvedValueOnce({ data: {} })
      .mockImplementationOnce(() => verificationPromise as never);

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ForgotPasswordScreen />);
    });

    act(() => mockViewProps.current.onEmailChange('before@example.com'));
    await act(async () => {
      await mockViewProps.current.onSendVerificationEmail();
    });

    act(() => mockViewProps.current.onVerificationCodeChange('123456'));
    await act(async () => {
      await Promise.resolve();
    });

    act(() => mockViewProps.current.onEditEmail());
    await act(async () => {
      resolveVerification({ data: { verificationToken: 'old-token' } });
      await verificationPromise;
    });

    expect(mockViewProps.current.step).toBe(1);
    expect(mockViewProps.current.isEmailVerified).toBe(false);
    expect(mockViewProps.current.tempPasswordStatus).toBe('idle');
    act(() => tree!.unmount());
  });
});
