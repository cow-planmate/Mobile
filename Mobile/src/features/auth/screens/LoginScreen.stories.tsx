import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView } from './LoginScreen.view';

const meta = {
  title: 'Screens/Auth/LoginScreen',
  component: LoginScreenView,
  args: {
    form: { email: '', password: '' },
    isLoading: false,
    focused: null,
    isEmailValid: true,
    isPasswordValid: true,
    onChange: () => {},
    onLogin: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onClearPassword: () => {},
    onNavigateToSignup: () => {},
    onNavigateToForgotPassword: () => {},
    onGoogleLogin: () => {},
    onNaverLogin: () => {},
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
    isEmailValid: false,
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
