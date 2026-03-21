import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { SignupScreenView } from '../../../screens/auth/SignupScreen.view';

const meta = {
  title: 'Screens/Auth/SignupScreen',
  component: SignupScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    step: 1,
    totalSteps: 4,
    form: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      age: '',
      gender: '',
    },
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    isLoading: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isNicknameVerified: false,
    isEmailDuplicate: false,
    isAgeModalVisible: false,
    focusedField: null,
    timeLeft: 300,
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isNextButtonEnabled: false,
    onChange: (name, value) => console.log(`Changed ${name} to ${value}`),
    onSendEmail: () => console.log('Send Email'),
    onVerifyCode: () => console.log('Verify Code'),
    onCheckNickname: () => console.log('Check Nickname'),
    onSignup: () => console.log('Signup Pressed'),
    onNextStep: () => console.log('Next Step'),
    onPrevStep: () => console.log('Prev Step'),
    onResetEmail: () => console.log('Reset Email'),
    onSelectAge: age => console.log(`Selected age: ${age}`),
    setAgeModalVisible: visible =>
      console.log(`Set age modal visible: ${visible}`),
    setFocusedField: field => console.log(`Set focused field: ${field}`),
    setIsPasswordVisible: visible =>
      console.log(`Set password visible: ${visible}`),
    setIsConfirmPasswordVisible: visible =>
      console.log(`Set confirm password visible: ${visible}`),
    formatTime: seconds =>
      `${Math.floor(seconds / 60)}:${(seconds % 60)
        .toString()
        .padStart(2, '0')}`,
  },
} satisfies Meta<typeof SignupScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1: Story = {
  name: '1',
  args: {
    step: 1,
  },
};

export const Step1_1: Story = {
  name: '1-1',
  args: {
    step: 1,
    showVerificationInput: true,
  },
};

export const Step1_2: Story = {
  name: '1-2',
  args: {
    step: 1,
    showVerificationInput: true,
    isEmailVerified: true,
  },
};

export const Step2: Story = {
  name: '2',
  args: {
    step: 2,
    isEmailVerified: true,
  },
};

export const Step3: Story = {
  name: '3',
  args: {
    step: 3,
    isEmailVerified: true,
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
  },
};

export const Step4: Story = {
  name: '4',
  args: {
    step: 4,
    isEmailVerified: true,
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isNicknameVerified: true,
  },
};
