import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ForgotPasswordScreenView,
  ForgotPasswordScreenViewProps,
  ForgotPasswordErrors,
  TempPasswordStatus,
} from './ForgotPasswordScreen.view';

const meta = {
  title: '02. 시작 및 인증/05. 비밀번호 찾기',
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

interface StoryProps extends Partial<ForgotPasswordScreenViewProps> {
  autoProgressToStep2?: boolean;
}

function StatefulForgotPasswordStory(props: StoryProps) {
  const [step, setStep] = useState(props.step || 1);
  const [email, setEmail] = useState(props.email || '');
  const [verificationCode, setVerificationCode] = useState(props.verificationCode || '');
  const [showVerificationInput, setShowVerificationInput] = useState(props.showVerificationInput || false);
  const [isEmailVerified, setIsEmailVerified] = useState(props.isEmailVerified || false);
  const [focusedField, setFocusedField] = useState<string | null>(props.focusedField || null);
  const [errors, setErrors] = useState<ForgotPasswordErrors>(props.errors || {});
  const [tempStatus, setTempStatus] = useState<TempPasswordStatus>(props.tempPasswordStatus || 'idle');
  const [isSendingEmail, setIsSendingEmail] = useState(props.isSendingEmail || false);
  const [timeLeft, setTimeLeft] = useState(props.timeLeft !== undefined ? props.timeLeft : 300);

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <ForgotPasswordScreenView
      {...meta.args}
      {...props}
      step={step}
      email={email}
      verificationCode={verificationCode}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isEmailFormatValid={isEmailFormatValid}
      focusedField={focusedField}
      errors={errors}
      tempPasswordStatus={tempStatus}
      isSendingEmail={isSendingEmail}
      timeLeft={timeLeft}
      onEmailChange={text => {
        setEmail(text);
        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
        action('onEmailChange')(text);
      }}
      onVerificationCodeChange={text => {
        setVerificationCode(text);
        if (errors.verificationCode) {
          setErrors(prev => ({ ...prev, verificationCode: undefined }));
        }
        action('onVerificationCodeChange')(text);

        if (text.length === 6 && (props.autoProgressToStep2 || text === '123456')) {
          setIsEmailVerified(true);
          setStep(2);
          setTempStatus('sending');
          setTimeout(() => setTempStatus('sent'), 1000);
        }
      }}
      onSendVerificationEmail={() => {
        setIsSendingEmail(true);
        action('onSendVerificationEmail')();
        setTimeout(() => {
          setIsSendingEmail(false);
          setShowVerificationInput(true);
          setTimeLeft(300);
        }, 500);
      }}
      onEditEmail={() => {
        setShowVerificationInput(false);
        setIsEmailVerified(false);
        setVerificationCode('');
        action('onEditEmail')();
      }}
      onRetryTempPassword={() => {
        action('onRetryTempPassword')();
        setTempStatus('sending');
        setTimeout(() => setTempStatus('sent'), 1000);
      }}
      onGoToLogin={() => action('onGoToLogin')()}
      onPrevStep={() => {
        action('onPrevStep')();
        if (step > 1) {
          setStep(1);
        } else {
          action('onExitForgotPassword')();
        }
      }}
      setFocusedField={setFocusedField}
    />
  );
}

export const Interactive_Flow: Story = {
  render: () => <StatefulForgotPasswordStory autoProgressToStep2 />,
};

export const Step1_Initial: Story = {
  render: () => <StatefulForgotPasswordStory step={1} />,
};

export const Step1_CodeSent: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={1}
      email="planmate@example.com"
      showVerificationInput={true}
      timeLeft={299}
      resendCooldown={45}
    />
  ),
};

export const Step1_CodeError: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={1}
      email="planmate@example.com"
      verificationCode="999999"
      showVerificationInput={true}
      errors={{
        verificationCode: '인증번호가 일치하지 않아요. 다시 확인해 주세요.',
      }}
      timeLeft={240}
    />
  ),
};

export const Step1_CodeExpired: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={1}
      email="planmate@example.com"
      showVerificationInput={true}
      isCodeExpired={true}
      timeLeft={0}
      errors={{
        verificationCode: '인증번호 유효시간이 만료되었어요. 재발송을 요청해 주세요.',
      }}
    />
  ),
};

export const Step1_Verified: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={1}
      email="planmate@example.com"
      verificationCode="123456"
      showVerificationInput={true}
      isEmailVerified={true}
    />
  ),
};

export const Step2_Sending: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={2}
      email="planmate@example.com"
      isEmailVerified={true}
      tempPasswordStatus="sending"
    />
  ),
};

export const Step2_SentSuccess: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={2}
      email="planmate@example.com"
      isEmailVerified={true}
      tempPasswordStatus="sent"
    />
  ),
};

export const Step2_SendFailed: Story = {
  render: () => (
    <StatefulForgotPasswordStory
      step={2}
      email="planmate@example.com"
      isEmailVerified={true}
      tempPasswordStatus="failed"
      errors={{
        form: '임시 비밀번호 발급에 실패했습니다. 다시 시도해 주세요.',
      }}
    />
  ),
};
