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

export const 기본화면: Story = {};

export const 입력완료화면: Story = {
  args: {
    form: { email: 'planmate.user@gmail.com', password: 'Planmate123!' },
  },
};

export const 비밀번호표시화면: Story = {
  args: {
    form: { email: 'planmate.user@gmail.com', password: 'Planmate123!' },
    isPasswordVisible: true,
  },
};

export const 로딩화면: Story = {
  args: {
    form: { email: 'planmate.user@gmail.com', password: 'Planmate123!' },
    isLoading: true,
  },
};

export const 에러발생화면: Story = {
  args: {
    form: { email: 'wrong@gmail.com', password: 'wrong' },
    error: '이메일 또는 비밀번호가 일치하지 않습니다.',
  },
};
