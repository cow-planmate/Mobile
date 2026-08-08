import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView } from './LoginScreen.view';

const meta = {
  title: 'Auth/Login',
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
    lastLoginMethod: null,
    snsAuthUrl: null,
    onSnsClose: () => {},
    onSnsNavigationStateChange: () => {},
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InvalidEmail: Story = {
  args: {
    form: { email: 'invalid-email', password: '' },
    errors: { email: '이메일 형식을 확인해 주세요.' },
  },
};
export const Loading: Story = {
  args: {
    isLoading: true,
    form: { email: 'planmate@example.com', password: 'password123' },
  },
};
