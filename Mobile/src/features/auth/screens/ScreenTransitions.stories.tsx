import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import IntroScreenView from './IntroScreen.view';
import { LoginScreenView, LoginErrors } from './LoginScreen.view';
import { SignupScreenView } from './SignupScreen.view';

type PreviewStackParamList = {
  Start: undefined;
  Intro: undefined;
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<PreviewStackParamList>();

const emptySignupForm = {
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  birthdate: '',
  gender: '',
};

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

function StartPreview({
  navigation,
}: NativeStackScreenProps<PreviewStackParamList, 'Start'>) {
  return (
    <View style={styles.startContainer}>
      <Text style={styles.startTitle}>Screen Transitions</Text>
      <Text style={styles.startDescription}>
        인트로는 앱 최초 화면이라 push 전환 없이 바로 뜬다. 버튼을 눌러
        Intro의 등장 애니메이션을 원할 때마다 다시 확인한다.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Intro')}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText}>인트로로 이동</Text>
      </Pressable>
    </View>
  );
}

function IntroPreview({
  navigation,
}: NativeStackScreenProps<PreviewStackParamList, 'Intro'>) {
  return (
    <IntroScreenView
      onStart={() => navigation.navigate('Signup')}
      onLogin={() => navigation.navigate('Login')}
    />
  );
}

function LoginPreview({
  navigation,
}: NativeStackScreenProps<PreviewStackParamList, 'Login'>) {
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
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors({});
      }}
      onLogin={() => {}}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onNavigateToSignup={() => navigation.navigate('Signup')}
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

function SignupPreview({
  navigation,
}: NativeStackScreenProps<PreviewStackParamList, 'Signup'>) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNextStep = () => {
    if (step >= totalSteps) return;
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      return;
    }
    navigation.goBack();
  };

  return (
    <SignupScreenView
      step={step}
      totalSteps={totalSteps}
      form={emptySignupForm}
      errors={{}}
      focusSeq={0}
      isPasswordVisible={false}
      isConfirmPasswordVisible={false}
      isSendingEmail={false}
      isVerifying={false}
      isSubmitting={false}
      isEmailFormatValid={false}
      showVerificationInput={false}
      isEmailVerified={false}
      isCodeExpired={false}
      resendCooldown={0}
      nicknameStatus="idle"
      focusedField={null}
      timeLeft={300}
      passwordRequirements={{ hasMinLength: false, hasCombination: false }}
      isPasswordMatch={false}
      isNextEnabled
      isAgreed={false}
      onChangeAgreement={() => {}}
      onChange={() => {}}
      onSendEmail={() => {}}
      onEditEmail={() => {}}
      onNextStep={handleNextStep}
      onPrevStep={handlePrevStep}
      setFocusedField={() => {}}
      setIsPasswordVisible={() => {}}
      setIsConfirmPasswordVisible={() => {}}
      formatTime={formatTime}
    />
  );
}

function ScreenTransitionsPreview() {
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="Start" component={StartPreview} />
      <Stack.Screen name="Intro" component={IntroPreview} />
      <Stack.Screen name="Login" component={LoginPreview} />
      <Stack.Screen name="Signup" component={SignupPreview} />
    </Stack.Navigator>
  );
}

const meta = {
  title: '02. 시작 및 인증/07. 화면 전환',
  component: ScreenTransitionsPreview,
} satisfies Meta<typeof ScreenTransitionsPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '기본' };

const styles = StyleSheet.create({
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  startTitle: {
    marginBottom: 12,
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  startDescription: {
    marginBottom: 24,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
