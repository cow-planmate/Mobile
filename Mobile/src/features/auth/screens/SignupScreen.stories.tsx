import type { Meta, StoryObj } from '@storybook/react';
import { SignupScreenView } from './SignupScreen.view';

const meta = {
  title: 'Screens/Auth/SignupScreen',
  component: SignupScreenView,
  args: {
    step: 1,
    totalSteps: 3,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      birthdate: '',
      gender: '',
    },
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
    formatTime: (s: number) =>
      `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof SignupScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1Email: Story = {
  args: { step: 1 },
};

/** 인증번호를 보낸 직후. 이메일 칸은 잠기고 타이머가 돈다. */
export const Step1CodeSent: Story = {
  args: {
    step: 1,
    form: {
      email: 'planmate@example.com',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      birthdate: '',
      gender: '',
    },
    isEmailFormatValid: true,
    showVerificationInput: true,
    timeLeft: 272,
    resendCooldown: 18,
  },
};

/** 인증 시간이 지난 상태. 0:00에서 멈추고 다시 받기만 남는다. */
export const Step1CodeExpired: Story = {
  args: {
    step: 1,
    form: {
      email: 'planmate@example.com',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      birthdate: '',
      gender: '',
    },
    isEmailFormatValid: true,
    showVerificationInput: true,
    isCodeExpired: true,
    timeLeft: 0,
  },
};

export const Step1EmailDuplicate: Story = {
  args: {
    step: 1,
    form: {
      email: 'planmate@example.com',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      birthdate: '',
      gender: '',
    },
    isEmailFormatValid: true,
    errors: { email: '이미 가입된 이메일이에요.' },
  },
};

export const Step2Password: Story = {
  args: { step: 2 },
};

export const Step2PasswordValid: Story = {
  args: {
    step: 2,
    form: {
      email: 'planmate@example.com',
      verificationCode: '123456',
      password: 'planmate1!',
      confirmPassword: 'planmate1!',
      nickname: '',
      birthdate: '',
      gender: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isNextEnabled: true,
  },
};

export const Step3NicknameChecking: Story = {
  args: {
    step: 3,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '플랜메이트',
      birthdate: '',
      gender: '',
    },
    nicknameStatus: 'checking' as const,
  },
};

export const Step3NicknameTaken: Story = {
  args: {
    step: 3,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '플랜메이트',
      birthdate: '',
      gender: '',
    },
    nicknameStatus: 'taken' as const,
  },
};

export const Step3NicknameAvailable: Story = {
  args: {
    step: 3,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '플랜메이트',
      birthdate: '',
      gender: '',
    },
    nicknameStatus: 'available' as const,
    isNextEnabled: true,
  },
};

/** 닉네임 확인이 끝나고 생년월일·성별·약관 동의까지 채운 상태 */
export const Step3ProfileFilled: Story = {
  args: {
    step: 3,
    form: {
      email: 'planmate@example.com',
      verificationCode: '123456',
      password: 'planmate1!',
      confirmPassword: 'planmate1!',
      nickname: '플랜메이트',
      birthdate: '1998-05-20',
      gender: 'female',
    },
    nicknameStatus: 'available' as const,
    isAgreed: true,
    isNextEnabled: true,
  },
};
