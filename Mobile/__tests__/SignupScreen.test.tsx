import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SignupScreen from '../src/features/auth/screens/SignupScreen';
import { SignupScreenView } from '../src/features/auth/screens/SignupScreen.view';

// Mocking axios
jest.mock('axios');

// Mocking Navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
  };
});

// Mocking useAuthStore
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

// Mocking AlertContext
const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

// Mocking Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, left: 0, right: 0, bottom: 34 }),
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = ({ children, ...rest }: any) =>
    React.createElement('View', rest, children);
  // entering/exiting은 .duration()을 체이닝하므로 자기 자신을 돌려준다.
  const animation: any = {};
  animation.duration = () => animation;
  return {
    __esModule: true,
    default: {
      View,
      // PressableScale이 Pressable을 감싸 쓴다. 목에서는 원본을 그대로 돌려준다.
      createAnimatedComponent: (Component: any) => Component,
    },
    useSharedValue: (value: any) => ({ value }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (value: any) => value,
    withSpring: (value: any) => value,
    interpolateColor: (_v: any, _in: any, output: any[]) => output[0],
    Easing: { out: () => () => 0, quad: () => 0 },
    FadeInDown: animation,
    FadeOut: animation,
    FadeInRight: animation,
    FadeInLeft: animation,
  };
});

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
          isNextEnabled={false} // 동의 전이므로 아직 false
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

    // Verify checkbox is rendered and can be clicked
    const checkboxWrapper = view.root.findByProps({ testID: 'agreement-checkbox' });
    expect(checkboxWrapper).toBeTruthy();

    ReactTestRenderer.act(() => {
      checkboxWrapper.props.onPress();
    });
    expect(mockOnChangeAgreement).toHaveBeenCalledWith(true);
  });
});
