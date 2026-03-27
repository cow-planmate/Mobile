import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { LoginScreenView } from '../../../screens/auth/LoginScreen.view';

const meta = {
  title: 'Screens/Auth/로그인화면',
  component: LoginScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    form: { email: '', password: '' },
    error: '',
    isLoading: false,
    focused: null,
    isPasswordVisible: false,
    onChange: (key, value) => console.log(`Changed ${key} to ${value}`),
    onLogin: () => console.log('Login Pressed'),
    onFocus: key => console.log(`Focused ${key}`),
    onBlur: () => console.log('Blurred'),
    onTogglePassword: () => console.log('Toggle Password'),
    onNavigateToSignup: () => console.log('Navigate to Signup'),
    onNavigateToForgotPassword: () =>
      console.log('Navigate to Forgot Password'),
    onGoogleLogin: () => console.log('Google Login'),
    onNaverLogin: () => console.log('Naver Login'),
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본',
};

export const Filled: Story = {
  name: '아이디 비밀번호 입력',
  args: {
    form: { email: 'planmate.user@gmail.com', password: 'Planmate123!' },
  },
};
