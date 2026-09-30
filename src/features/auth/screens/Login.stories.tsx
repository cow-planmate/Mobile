import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreenView, LoginScreenViewProps, LoginErrors } from './LoginScreen.view';

const meta = {
  title: '02. 시작 및 인증/02. 로그인',
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

interface StoryProps extends Partial<LoginScreenViewProps> {
  mockSubmitLoading?: boolean;
}

function StatefulLoginStory(props: StoryProps) {
  const [form, setForm] = useState(props.form || { email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(props.focused || null);
  const [errors, setErrors] = useState<LoginErrors>(props.errors || {});
  const [isLoading, setIsLoading] = useState(props.isLoading || false);
  const [snsAuthUrl, setSnsAuthUrl] = useState<string | null>(props.snsAuthUrl || null);

  const handleLogin = () => {
    action('onLogin')(form);
    if (!form.email) {
      setErrors({ email: '이메일을 입력해 주세요.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: '이메일 형식을 확인해 주세요.' });
      return;
    }
    if (!form.password) {
      setErrors({ password: '비밀번호를 입력해 주세요.' });
      return;
    }

    if (props.mockSubmitLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setErrors({ form: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      }, 1200);
    }
  };

  return (
    <LoginScreenView
      {...meta.args}
      {...props}
      form={form}
      errors={errors}
      focused={focused}
      isLoading={isLoading}
      snsAuthUrl={snsAuthUrl}
      onChange={(key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key as keyof LoginErrors] || errors.form) {
          setErrors((prev: LoginErrors) => ({ ...prev, [key]: undefined, form: undefined }));
        }
        action('onChange')(key, value);
      }}
      onLogin={handleLogin}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onGoogleLogin={() => {
        action('onGoogleLogin')();
        setSnsAuthUrl('https://accounts.google.com/o/oauth2/v2/auth');
      }}
      onNaverLogin={() => {
        action('onNaverLogin')();
        setSnsAuthUrl('https://nid.naver.com/oauth2.0/authorize');
      }}
      onSnsClose={() => {
        action('onSnsClose')();
        setSnsAuthUrl(null);
      }}
    />
  );
}

export const Interactive_Flow: Story = {
  name: '상호작용 흐름',
  render: () => <StatefulLoginStory mockSubmitLoading />,
};

export const Default_Empty: Story = {
  name: '빈 입력',
  render: () => <StatefulLoginStory form={{ email: '', password: '' }} />,
};

export const Filled_Valid: Story = {
  name: '유효한 입력',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'planmate@example.com', password: 'Password123!' }}
    />
  ),
};

export const Error_InvalidEmail: Story = {
  name: '이메일 형식 오류',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'invalid-email-format', password: '' }}
      errors={{ email: '이메일 형식을 확인해 주세요.' }}
    />
  ),
};

export const Error_InvalidPassword: Story = {
  name: '비밀번호 오류',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'planmate@example.com', password: '123' }}
      errors={{ password: '비밀번호를 8자 이상 입력해 주세요.' }}
    />
  ),
};

export const Error_AccountNotFound: Story = {
  name: '계정 없음',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'wrong@example.com', password: 'wrongpassword' }}
      errors={{ form: '이메일 또는 비밀번호가 일치하지 않습니다.' }}
    />
  ),
};

export const Loading_Submitting: Story = {
  name: '로그인 중',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'planmate@example.com', password: 'Password123!' }}
      isLoading={true}
    />
  ),
};

export const LastLogin_Email: Story = {
  name: '최근 로그인: 이메일',
  render: () => (
    <StatefulLoginStory
      form={{ email: 'planmate@example.com', password: '' }}
      lastLoginMethod="email"
    />
  ),
};

export const LastLogin_Google: Story = {
  name: '최근 로그인: 구글',
  render: () => <StatefulLoginStory lastLoginMethod="google" />,
};

export const LastLogin_Naver: Story = {
  name: '최근 로그인: 네이버',
  render: () => <StatefulLoginStory lastLoginMethod="naver" />,
};

export const Modal_SnsWebView: Story = {
  name: '소셜 로그인 창',
  parameters: {
    dismissibleFullScreenModal: true,
  },
  render: () => (
    <StatefulLoginStory
      snsAuthUrl="https://accounts.google.com/o/oauth2/v2/auth"
    />
  ),
};
