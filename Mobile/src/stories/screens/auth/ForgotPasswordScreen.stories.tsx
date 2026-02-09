import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ForgotPasswordScreenView } from '../../../screens/auth/ForgotPasswordScreen.view';

const meta = {
  title: 'Screens/Auth/ForgotPasswordScreen',
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

export const Step1_Initial: Story = {
  args: {
    step: 1,
  },
};

export const Step1_VerificationSent: Story = {
  args: {
    step: 1,
    showVerificationInput: true,
  },
};

export const Step1_Verified: Story = {
  args: {
    step: 1,
    showVerificationInput: true,
    isEmailVerified: true,
  },
};

export const Step2: Story = {
  args: {
    step: 2,
  },
};
