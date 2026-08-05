import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView } from './LoginScreen.view';

const meta = {
  title: 'Screens/Auth/LoginScreen',
  component: LoginScreenView,
  args: {
    form: { email: '', password: '' },
    errors: {},
    focusSeq: 0,
    isLoading: false,
    focused: null,
    onChange: () => {},
    onLogin: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onNavigateToSignup: () => {},
    onNavigateToForgotPassword: () => {},
    onGoogleLogin: () => {},
    onNaverLogin: () => {},
    snsAuthUrl: null,
    onSnsClose: () => {},
    onSnsNavigationStateChange: () => {},
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;

type Story = StoryObj<typeof LoginScreenView>;

export const Default: Story = {};

export const TypingEmail: Story = {
  args: {
    form: { email: 'test@example', password: '' },
    focused: 'email',
  },
};

export const InvalidEmail: Story = {
  args: {
    form: { email: 'invalid-email', password: '' },
    errors: { email: '이메일 형식을 확인해 주세요.' },
  },
};

export const EmptyPassword: Story = {
  args: {
    form: { email: 'test@example.com', password: '' },
    errors: { password: '비밀번호를 입력해 주세요.' },
  },
};

/** 서버가 자격 증명 불일치를 돌려준 상태. 두 필드가 함께 붉어진다. */
export const InvalidCredentials: Story = {
  args: {
    form: { email: 'test@example.com', password: 'wrongpassword' },
    errors: {
      form: '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.',
    },
  },
};

export const TypingPassword: Story = {
  args: {
    form: { email: 'test@example.com', password: 'pass' },
    focused: 'password',
  },
};

export const LoadingState: Story = {
  args: {
    isLoading: true,
    form: { email: 'test@example.com', password: 'password123' },
  },
};
