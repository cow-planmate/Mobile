import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView, LoginErrors } from './LoginScreen.view';

const meta = {
  title: 'Auth/로그인',
  component: LoginScreenView,
  args: {
    form: { email: '', password: '' },
    errors: {},
    focusSeq: 0,
    isLoading: false,
    focused: null,
    onChange: action('onChange'),
    onLogin: action('onLogin'),
    onFocus: action('onFocus'),
    onBlur: action('onBlur'),
    onNavigateToSignup: action('onNavigateToSignup'),
    onNavigateToForgotPassword: action('onNavigateToForgotPassword'),
    onGoogleLogin: action('onGoogleLogin'),
    onNaverLogin: action('onNaverLogin'),
    lastLoginMethod: null,
    snsAuthUrl: null,
    onSnsClose: action('onSnsClose'),
    onSnsNavigationStateChange: action('onSnsNavigationStateChange'),
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveLogin({ initialSnsUrl = null }: { initialSnsUrl?: string | null }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [snsAuthUrl, setSnsAuthUrl] = useState<string | null>(initialSnsUrl);

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
      onNavigateToSignup={action('onNavigateToSignup')}
      onNavigateToForgotPassword={action('onNavigateToForgotPassword')}
      onGoogleLogin={() => setSnsAuthUrl('https://accounts.google.com/o/oauth2/v2/auth')}
      onNaverLogin={() => setSnsAuthUrl('https://nid.naver.com/oauth2.0/authorize')}
      lastLoginMethod={null}
      snsAuthUrl={snsAuthUrl}
      onSnsClose={() => {
        action('onSnsClose')();
        setSnsAuthUrl(null);
      }}
      onSnsNavigationStateChange={action('onSnsNavigationStateChange')}
    />
  );
}

export const Default: Story = { render: () => <InteractiveLogin /> };

export const FilledValid: Story = {
  args: {
    form: { email: 'planmate@planmate.com', password: 'password123!' },
  },
};

export const InvalidEmail: Story = {
  args: {
    form: { email: 'invalid-email', password: '' },
    errors: { email: '이메일 형식을 확인해 주세요.' },
  },
};

export const InvalidPassword: Story = {
  args: {
    form: { email: 'planmate@planmate.com', password: '123' },
    errors: { password: '비밀번호를 8자 이상 입력해 주세요.' },
  },
};

export const WithFormError: Story = {
  args: {
    form: { email: 'planmate@planmate.com', password: 'wrongpassword' },
    errors: { form: '이메일 또는 비밀번호가 일치하지 않습니다.' },
  },
};

export const WithMultipleErrors: Story = {
  args: {
    form: { email: 'invalid-email', password: '' },
    errors: {
      form: '입력하신 정보를 다시 확인해 주세요.',
      email: '올바른 이메일 형식이 아닙니다.',
      password: '비밀번호를 입력해 주세요.',
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    form: { email: 'planmate@planmate.com', password: 'password123!' },
  },
};

export const LastLoginEmail: Story = {
  args: {
    form: { email: 'planmate@planmate.com', password: '' },
    lastLoginMethod: 'email',
  },
};

export const LastLoginGoogle: Story = {
  args: {
    lastLoginMethod: 'google',
  },
};

export const LastLoginNaver: Story = {
  args: {
    lastLoginMethod: 'naver',
  },
};
