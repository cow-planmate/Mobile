import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ForgotPasswordScreenView } from '../../../screens/auth/ForgotPasswordScreen.view';

const meta = {
  title: 'Screens/Auth/비밀번호찾기화면',
  component: ForgotPasswordScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    step: 1,
    totalSteps: 2,
    email: '',
    verificationCode: '',
    showVerificationInput: false,
    isEmailVerified: false,
    isLoading: false,
    focusedField: null,
    timeLeft: 300,
    onEmailChange: email => console.log(`Email changed to ${email}`),
    onVerificationCodeChange: code => console.log(`Code changed to ${code}`),
    onSendVerificationEmail: () => console.log('Send verification email'),
    onVerifyCode: () => console.log('Verify code'),
    onNextStep: () => console.log('Next step'),
    onSendTempPassword: () => console.log('Send temp password'),
    onPrevStep: () => console.log('Prev step'),
    onResetVerification: () => console.log('Reset verification'),
    setFocusedField: field => console.log(`Set focused field: ${field}`),
    formatTime: seconds =>
      `${Math.floor(seconds / 60)}:${(seconds % 60)
        .toString()
        .padStart(2, '0')}`,
  },
} satisfies Meta<typeof ForgotPasswordScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default1: Story = {
  name: '이메일 입력',
  args: {
    step: 1,
  },
};

export const Default2: Story = {
  name: '인증번호 입력',
  args: {
    step: 1,
    email: 'planmate.user@gmail.com',
    showVerificationInput: true,
  },
};

export const Default3: Story = {
  name: '인증 완료',
  args: {
    step: 1,
    email: 'planmate.user@gmail.com',
    verificationCode: '123456',
    showVerificationInput: true,
    isEmailVerified: true,
  },
};

export const Default4: Story = {
  name: '임시 비밀번호 발송',
  args: {
    step: 2,
  },
};
