import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SignupScreen from '../src/features/auth/screens/SignupScreen';
import { SignupScreenView } from '../src/features/auth/screens/SignupScreen.view';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),

    useFocusEffect: (effect: React.EffectCallback) =>
      React.useEffect(effect, [effect]),
  };
});

const mockLogin = jest.fn(() => Promise.resolve());
const mockSetNeedsThemeSelection = jest.fn();
jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      login: mockLogin,
      setNeedsThemeSelection: mockSetNeedsThemeSelection,
      isLoading: false,
    }),
}));

const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, left: 0, right: 0, bottom: 34 }),
}));

describe('SignupScreen components & agreement validation', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SignupScreen correctly', () => {
    let renderer: any;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<SignupScreen />);
    });
    expect(renderer).toBeDefined();
  });

  it('renders SignupScreenView step 3 with agreement checkbox correctly', () => {
    const form = {
      email: 'test@example.com',
      verificationCode: '123456',
      password: 'password123!',
      confirmPassword: 'password123!',
      nickname: '닉네임',
      gender: 'male',
      birthdate: '2000-01-01',
    };

    const mockOnChange = jest.fn();
    const mockOnSendEmail = jest.fn();
    const mockOnEditEmail = jest.fn();
    const mockOnNextStep = jest.fn();
    const mockOnPrevStep = jest.fn();
    const mockSetFocusedField = jest.fn();
    const mockSetIsPasswordVisible = jest.fn();
    const mockSetIsConfirmPasswordVisible = jest.fn();
    const mockFormatTime = jest.fn(() => '5:00');
    const mockOnChangeAgreement = jest.fn();

    let view: any;
    ReactTestRenderer.act(() => {
      view = ReactTestRenderer.create(
        <SignupScreenView
          step={3}
          totalSteps={3}
          form={form}
          errors={{}}
          focusSeq={0}
          isPasswordVisible={false}
          isConfirmPasswordVisible={false}
          isSendingEmail={false}
          isVerifying={false}
          isSubmitting={false}
          isEmailFormatValid={true}
          showVerificationInput={false}
          isEmailVerified={true}
          isCodeExpired={false}
          resendCooldown={0}
          nicknameStatus="available"
          focusedField={null}
          timeLeft={300}
          passwordRequirements={{ hasMinLength: true, hasCombination: true }}
          isPasswordMatch={true}
          isNextEnabled={false} 
          isAgreed={false}
          onChangeAgreement={mockOnChangeAgreement}
          onChange={mockOnChange}
          onSendEmail={mockOnSendEmail}
          onEditEmail={mockOnEditEmail}
          onNextStep={mockOnNextStep}
          onPrevStep={mockOnPrevStep}
          setFocusedField={mockSetFocusedField}
          setIsPasswordVisible={mockSetIsPasswordVisible}
          setIsConfirmPasswordVisible={mockSetIsConfirmPasswordVisible}
          formatTime={mockFormatTime}
        />
      );
    });

    const checkboxWrapper = view.root.findByProps({ testID: 'agreement-checkbox' });
    expect(checkboxWrapper).toBeTruthy();

    ReactTestRenderer.act(() => {
      checkboxWrapper.props.onPress();
    });
    expect(mockOnChangeAgreement).toHaveBeenCalledWith(true);
  });

  it('이메일 인증 요청을 같은 렌더에서 연속 실행해도 한 번만 전송한다', async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    const request = new Promise(resolve => {
      resolveRequest = resolve;
    });
    mockedAxios.post.mockReturnValue(request as never);

    let screen: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      screen = ReactTestRenderer.create(<SignupScreen />);
    });

    let props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => {
      props.onChange('email', 'user@example.com');
    });
    props = screen!.root.findByType(SignupScreenView).props;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    ReactTestRenderer.act(() => {
      first = props.onSendEmail();
      second = props.onSendEmail();
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    await ReactTestRenderer.act(async () => {
      resolveRequest({ data: {} });
      await Promise.all([first!, second!]);
    });
    ReactTestRenderer.act(() => screen!.unmount());
  });

  it('이메일 수정 후 이전 인증번호 확인 응답을 무시한다', async () => {
    let resolveVerification: (value: unknown) => void = () => undefined;
    const verificationPromise = new Promise(resolve => {
      resolveVerification = resolve;
    });
    mockedAxios.post
      .mockResolvedValueOnce({ data: {} })
      .mockImplementationOnce(() => verificationPromise as never);

    let screen: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      screen = ReactTestRenderer.create(<SignupScreen />);
    });

    let props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => {
      props.onChange('email', 'before@example.com');
    });
    props = screen!.root.findByType(SignupScreenView).props;

    await ReactTestRenderer.act(async () => {
      await props.onSendEmail();
    });

    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => {
      props.onChange('verificationCode', '123456');
    });
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => {
      props.onEditEmail();
    });

    await ReactTestRenderer.act(async () => {
      resolveVerification({ data: { verificationToken: 'old-token' } });
      await verificationPromise;
    });

    props = screen!.root.findByType(SignupScreenView).props;
    expect(props.step).toBe(1);
    expect(props.isEmailVerified).toBe(false);
    ReactTestRenderer.act(() => screen!.unmount());
  });

  it('닉네임을 바꾸면 이전 중복 확인 응답을 무시한다', async () => {
    let resolveNickname: (value: unknown) => void = () => undefined;
    const nicknamePromise = new Promise(resolve => {
      resolveNickname = resolve;
    });
    mockedAxios.post.mockImplementation(url => {
      if (url === '/api/auth/email/verification') {
        return Promise.resolve({ data: {} });
      }
      if (url === '/api/auth/email/verification/confirm') {
        return Promise.resolve({ data: { verificationToken: 'token' } });
      }
      return nicknamePromise as never;
    });

    let screen: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      screen = ReactTestRenderer.create(<SignupScreen />);
    });

    let props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => props.onChange('email', 'user@example.com'));
    props = screen!.root.findByType(SignupScreenView).props;
    await ReactTestRenderer.act(async () => props.onSendEmail());

    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() =>
      props.onChange('verificationCode', '123456'),
    );
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });
    ReactTestRenderer.act(() => jest.advanceTimersByTime(700));

    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => {
      props.onChange('password', 'password1!');
      props.onChange('confirmPassword', 'password1!');
    });
    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => props.onNextStep());

    props = screen!.root.findByType(SignupScreenView).props;
    ReactTestRenderer.act(() => props.onChange('nickname', '테스터'));
    ReactTestRenderer.act(() => jest.advanceTimersByTime(500));
    ReactTestRenderer.act(() => props.onChange('nickname', ''));

    await ReactTestRenderer.act(async () => {
      resolveNickname({ data: { nicknameAvailable: true } });
      await nicknamePromise;
    });

    props = screen!.root.findByType(SignupScreenView).props;
    expect(props.form.nickname).toBe('');
    expect(props.nicknameStatus).toBe('idle');
    ReactTestRenderer.act(() => screen!.unmount());
  });
});
