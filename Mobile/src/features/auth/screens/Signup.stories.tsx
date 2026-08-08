import type { Meta, StoryObj } from '@storybook/react';
import { SignupScreenView } from './SignupScreen.view';

const emptyForm = {
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  birthdate: '',
  gender: '',
};

const meta = {
  title: 'Auth/Signup',
  component: SignupScreenView,
  args: {
    step: 1,
    totalSteps: 3,
    form: emptyForm,
    errors: {},
    focusSeq: 0,
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    isSendingEmail: false,
    isVerifying: false,
    isSubmitting: false,
    isEmailFormatValid: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isCodeExpired: false,
    resendCooldown: 0,
    nicknameStatus: 'idle' as const,
    focusedField: null,
    timeLeft: 300,
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isNextEnabled: false,
    isAgreed: false,
    onChangeAgreement: () => {},
    onChange: () => {},
    onSendEmail: () => {},
    onEditEmail: () => {},
    onNextStep: () => {},
    onPrevStep: () => {},
    setFocusedField: () => {},
    setIsPasswordVisible: () => {},
    setIsConfirmPasswordVisible: () => {},
    formatTime: (seconds: number) =>
      `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof SignupScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const PasswordStep: Story = { args: { step: 2 } };
export const ProfileStep: Story = {
  args: {
    step: 3,
    form: {
      ...emptyForm,
      email: 'planmate@example.com',
      verificationCode: '123456',
      password: 'planmate1!',
      confirmPassword: 'planmate1!',
      nickname: '플랜메이트',
      birthdate: '1998-05-20',
      gender: 'female',
    },
    nicknameStatus: 'available' as const,
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isEmailVerified: true,
    isAgreed: true,
    isNextEnabled: true,
  },
};
