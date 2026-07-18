import type { Meta, StoryObj } from '@storybook/react';
import { SignupScreenView } from './SignupScreen.view';

const meta = {
  title: 'Screens/Auth/SignupScreen',
  component: SignupScreenView,
  args: {
    step: 1,
    totalSteps: 4,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      age: '',
      gender: '',
    },
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    isLoading: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isNicknameVerified: false,
    isEmailDuplicate: false,
    focusedField: null,
    timeLeft: 300,
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isNextButtonEnabled: false,
    isAgreed: false,
    onChangeAgreement: () => {},
    onChange: () => {},
    onSendEmail: () => {},
    onVerifyCode: () => {},
    onCheckNickname: () => {},
    onSignup: () => {},
    onNextStep: () => {},
    onPrevStep: () => {},
    onResetEmail: () => {},
    setFocusedField: () => {},
    setIsPasswordVisible: () => {},
    setIsConfirmPasswordVisible: () => {},
    formatTime: (s) => `0${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof SignupScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1Email: Story = {
  args: { step: 1 },
};

export const Step2Password: Story = {
  args: { step: 2 },
};

export const Step3Nickname: Story = {
  args: { step: 3 },
};

export const Step4Info: Story = {
  args: { step: 4 },
};
