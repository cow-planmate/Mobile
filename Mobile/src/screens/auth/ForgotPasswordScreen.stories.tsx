import type { Meta, StoryObj } from '@storybook/react';
import { ForgotPasswordScreenView } from './ForgotPasswordScreen.view';

const meta = {
  title: 'Screens/Auth/ForgotPasswordScreen',
  component: ForgotPasswordScreenView,
  args: {
    step: 1,
    totalSteps: 2,
    email: '',
    verificationCode: '',
    showVerificationInput: false,
    isEmailVerified: false,
    isLoading: false,
    focusedField: null,
    timeLeft: 300,
    onEmailChange: () => {},
    onVerificationCodeChange: () => {},
    onSendVerificationEmail: () => {},
    onVerifyCode: () => {},
    onNextStep: () => {},
    onSendTempPassword: () => {},
    onPrevStep: () => {},
    onResetVerification: () => {},
    setFocusedField: () => {},
    formatTime: (s) => `0${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof ForgotPasswordScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1Email: Story = {
  args: { step: 1 },
};

export const Step1Verification: Story = {
  args: {
    step: 1,
    showVerificationInput: true,
    email: 'test@example.com',
  },
};

export const Step2TempPassword: Story = {
  args: {
    step: 2,
    email: 'test@example.com',
    isEmailVerified: true,
  },
};
