import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ForgotPasswordScreenView,
  ForgotPasswordErrors,
  TempPasswordStatus,
} from './ForgotPasswordScreen.view';

const meta = {
  title: 'Auth/비밀번호 찾기',
  component: ForgotPasswordScreenView,
  args: {
    step: 1,
    totalSteps: 2,
    email: '',
    verificationCode: '',
    errors: {},
    focusSeq: 0,
    isSendingEmail: false,
    isVerifying: false,
    isEmailFormatValid: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isCodeExpired: false,
    resendCooldown: 0,
    focusedField: null,
    timeLeft: 300,
    tempPasswordStatus: 'idle' as TempPasswordStatus,
    onEmailChange: action('onEmailChange'),
    onVerificationCodeChange: action('onVerificationCodeChange'),
    onSendVerificationEmail: action('onSendVerificationEmail'),
    onEditEmail: action('onEditEmail'),
    onRetryTempPassword: action('onRetryTempPassword'),
    onGoToLogin: action('onGoToLogin'),
    onPrevStep: action('onPrevStep'),
    setFocusedField: action('setFocusedField'),
    formatTime: (seconds: number) =>
      `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof ForgotPasswordScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveForgotPassword() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [step, setStep] = useState(1);
  const [tempStatus, setTempStatus] = useState<TempPasswordStatus>('idle');

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <ForgotPasswordScreenView
      {...meta.args}
      step={step}
      email={email}
      verificationCode={verificationCode}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isEmailFormatValid={isEmailFormatValid}
      focusedField={focusedField}
      errors={errors}
      tempPasswordStatus={tempStatus}
      onEmailChange={text => {
        setEmail(text);
        setErrors({});
      }}
      onVerificationCodeChange={text => {
        setVerificationCode(text);
        if (text.length === 6) {
          setIsEmailVerified(true);
          setStep(2);
          setTempStatus('sent');
        }
      }}
      onSendVerificationEmail={() => {
        setShowVerificationInput(true);
      }}
      onEditEmail={() => {
        setShowVerificationInput(false);
        setIsEmailVerified(false);
      }}
      onRetryTempPassword={() => {
        setTempStatus('sending');
        setTimeout(() => setTempStatus('sent'), 1000);
      }}
      onPrevStep={() => {
        if (step > 1) setStep(step - 1);
      }}
      setFocusedField={setFocusedField}
    />
  );
}

export const Default: Story = { render: () => <InteractiveForgotPassword /> };

export const CodeSent: Story = {
  args: {
    email: 'user@example.com',
    isEmailFormatValid: true,
    showVerificationInput: true,
    resendCooldown: 45,
  },
};

export const CodeExpired: Story = {
  args: {
    email: 'user@example.com',
    isEmailFormatValid: true,
    showVerificationInput: true,
    isCodeExpired: true,
    errors: { verificationCode: '인증번호 유효시간이 만료되었습니다.' },
  },
};

export const TempPasswordSent: Story = {
  args: {
    step: 2,
    email: 'user@example.com',
    isEmailVerified: true,
    tempPasswordStatus: 'sent' as TempPasswordStatus,
  },
};

export const TempPasswordFailed: Story = {
  args: {
    step: 2,
    email: 'user@example.com',
    isEmailVerified: true,
    tempPasswordStatus: 'failed' as TempPasswordStatus,
    errors: { form: '임시 비밀번호 발급에 실패했습니다. 다시 시도해 주세요.' },
  },
};
