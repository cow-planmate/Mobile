import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView, LoginErrors } from './LoginScreen.view';

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

function InteractiveLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});

  return (
    <LoginScreenView
      form={form}
      errors={errors}
      focusSeq={0}
      isLoading={false}
      focused={focused}
      onChange={(key, value) => {
        setForm(previous => ({ ...previous, [key]: value }));
        setErrors({});
      }}
      onLogin={() => {
        if (!form.email || !form.password) {
          setErrors({ form: '이메일과 비밀번호를 입력해 주세요.' });
        }
      }}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onNavigateToSignup={() => {}}
      onNavigateToForgotPassword={() => {}}
      onGoogleLogin={() => {}}
      onNaverLogin={() => {}}
      lastLoginMethod={null}
      snsAuthUrl={null}
      onSnsClose={() => {}}
      onSnsNavigationStateChange={() => {}}
    />
  );
}

export const Default: Story = { render: () => <InteractiveLogin /> };
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
