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
    errors: {},
    focusSeq: 0,
    isSendingEmail: false,
    isVerifying: false,
    isEmailFormatValid: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isCodeExpired: false,
    resendCooldown: 0,
    focusedField: null,
    timeLeft: 300,
    tempPasswordStatus: 'idle' as const,
    onEmailChange: () => {},
    onVerificationCodeChange: () => {},
    onSendVerificationEmail: () => {},
    onEditEmail: () => {},
    onRetryTempPassword: () => {},
    onGoToLogin: () => {},
    onPrevStep: () => {},
    setFocusedField: () => {},
    formatTime: (s: number) =>
      `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof ForgotPasswordScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1Email: Story = {
  args: { step: 1 },
};

export const Step1CodeSent: Story = {
  args: {
    step: 1,
    email: 'planmate@example.com',
    isEmailFormatValid: true,
    showVerificationInput: true,
    timeLeft: 272,
    resendCooldown: 18,
  },
};

export const Step1CodeExpired: Story = {
  args: {
    step: 1,
    email: 'planmate@example.com',
    isEmailFormatValid: true,
    showVerificationInput: true,
    isCodeExpired: true,
    timeLeft: 0,
  },
};

export const Step1EmailInvalid: Story = {
  args: {
    step: 1,
    email: 'invalid-email',
    errors: { email: '이메일 형식을 확인해 주세요.' },
  },
};

/** 인증까지 끝낸 직후, 결과 화면으로 넘어가기 전 잠깐 보이는 상태 */
export const Step1Verified: Story = {
  args: {
    step: 1,
    email: 'planmate@example.com',
    isEmailFormatValid: true,
    showVerificationInput: true,
    isEmailVerified: true,
    verificationCode: '482913',
  },
};

export const Step2Sending: Story = {
  args: {
    step: 2,
    email: 'planmate@example.com',
    tempPasswordStatus: 'sending' as const,
  },
};

export const Step2Sent: Story = {
  args: {
    step: 2,
    email: 'planmate@example.com',
    tempPasswordStatus: 'sent' as const,
  },
};

export const Step2Failed: Story = {
  args: {
    step: 2,
    email: 'planmate@example.com',
    tempPasswordStatus: 'failed' as const,
    errors: { form: '임시 비밀번호 발급 권한이 없어요. 잠시 후 다시 시도해 주세요.' },
  },
};
