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

  it('renders SignupScreenView step 4 with agreement checkbox correctly', () => {
    const form = {
      email: 'test@example.com',
      verificationCode: '123456',
      password: 'password123!',
      confirmPassword: 'password123!',
      nickname: '닉네임',
      gender: 'male',
      age: '25',
    };

    const mockOnChange = jest.fn();
    const mockOnSendEmail = jest.fn();
    const mockOnVerifyCode = jest.fn();
    const mockOnCheckNickname = jest.fn();
    const mockOnSignup = jest.fn();
    const mockOnNextStep = jest.fn();
    const mockOnPrevStep = jest.fn();
    const mockOnResetEmail = jest.fn();
    const mockSetFocusedField = jest.fn();
    const mockSetIsPasswordVisible = jest.fn();
    const mockSetIsConfirmPasswordVisible = jest.fn();
    const mockFormatTime = jest.fn(() => '5:00');
    const mockOnChangeAgreement = jest.fn();

    let view: any;
    ReactTestRenderer.act(() => {
      view = ReactTestRenderer.create(
        <SignupScreenView
          step={4}
          totalSteps={4}
          form={form}
          isPasswordVisible={false}
          isConfirmPasswordVisible={false}
          isLoading={false}
          showVerificationInput={false}
          isEmailVerified={true}
          isNicknameVerified={true}
          isEmailDuplicate={false}
          focusedField={null}
          timeLeft={300}
          passwordRequirements={{ hasMinLength: true, hasCombination: true }}
          isPasswordMatch={true}
          isNextButtonEnabled={false} // Initially false if not agreed
          isAgreed={false}
          onChangeAgreement={mockOnChangeAgreement}
          onChange={mockOnChange}
          onSendEmail={mockOnSendEmail}
          onVerifyCode={mockOnVerifyCode}
          onCheckNickname={mockOnCheckNickname}
          onSignup={mockOnSignup}
          onNextStep={mockOnNextStep}
          onPrevStep={mockOnPrevStep}
          onResetEmail={mockOnResetEmail}
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
