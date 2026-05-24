import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { SignupScreenView } from '../../../screens/auth/SignupScreen.view';

const meta = {
  title: 'Screens/Auth/회원가입화면',
  component: SignupScreenView,
  render: (args: any) => {
    const [isAgeModalVisible, setAgeModalVisible] = useState(
      args.isAgeModalVisible,
    );

    useEffect(() => {
      setAgeModalVisible(args.isAgeModalVisible);
    }, [args.isAgeModalVisible]);

    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SignupScreenView
          {...args}
          isAgeModalVisible={isAgeModalVisible}
          setAgeModalVisible={setAgeModalVisible}
        />
      </View>
    );
  },
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

export const 이메일인증화면: Story = {
  args: {
    step: 1,
  },
};

export const 이메일인증번호입력화면: Story = {
  args: {
    step: 1,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      age: '',
      gender: '',
    },
    showVerificationInput: true,
  },
};

export const 이메일인증완료화면: Story = {
  args: {
    step: 1,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '123456',
      password: '',
      confirmPassword: '',
      nickname: '',
      age: '',
      gender: '',
    },
    showVerificationInput: true,
    isEmailVerified: true,
  },
};

export const 비밀번호설정화면: Story = {
  args: {
    step: 2,
    isEmailVerified: true,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '123456',
      password: 'Planmate123!',
      confirmPassword: 'Planmate123!',
      nickname: '',
      age: '',
      gender: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
  },
};

export const 닉네임설정화면: Story = {
  args: {
    step: 3,
    isEmailVerified: true,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '123456',
      password: 'Planmate123!',
      confirmPassword: 'Planmate123!',
      nickname: '플랜메이트',
      age: '',
      gender: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isNicknameVerified: true,
  },
};

export const 내정보입력화면: Story = {
  args: {
    step: 4,
    isEmailVerified: true,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '123456',
      password: 'Planmate123!',
      confirmPassword: 'Planmate123!',
      nickname: '플랜메이트',
      age: '',
      gender: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isNicknameVerified: true,
  },
};

export const 연령선택모달화면: Story = {
  args: {
    step: 4,
    isEmailVerified: true,
    form: {
      email: 'planmate.user@gmail.com',
      verificationCode: '123456',
      password: 'Planmate123!',
      confirmPassword: 'Planmate123!',
      nickname: '플랜메이트',
      age: '',
      gender: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isNicknameVerified: true,
    isAgeModalVisible: true,
  },
};
