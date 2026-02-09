import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { LoginScreenView } from '../../../screens/auth/LoginScreen.view';

const meta = {
  title: 'Screens/Auth/LoginScreen',
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
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
};
