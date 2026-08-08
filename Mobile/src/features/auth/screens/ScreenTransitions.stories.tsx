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

/**
 * AuthStack의 화면 전환·콘텐츠 등장 애니메이션이 어떻게 보이는지 확인하기
 * 위한 프리뷰. 실제 API·검증 로직은 붙이지 않고 화면 이동 자체만 재현한다.
 *
 * 화면 간 슬라이드 없이 즉시 전환되는 쪽을 비교해 보기 위해 모든 전환의
 * animation을 'none'으로 뺐다. 콘텐츠 등장(revealStep)은 각 화면 컴포넌트
 * 안에 그대로 남아 있으므로, 화면은 바로 바뀌고 그 위에서 콘텐츠만
 * 떠오르는 모습이 된다.
 *
 * Start 화면은 실제 앱에는 없는 프리뷰 전용 진입점이다. Intro가 실제
 * 앱에서는 스택 최초 화면이라 마운트되자마자 등장 모션이 한 번만 재생되고
 * 끝나 다시 확인하기 어려운데, Start의 버튼으로 Intro에 진입하게 하면
 * 원할 때마다 다시 눌러 재생할 수 있다.
 */
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

  /** 실제 이메일 인증·비밀번호 검증 없이 다음 버튼만으로 바로 다음 단계를 보여준다. */
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
  title: 'Screen Transitions',
  component: ScreenTransitionsPreview,
} satisfies Meta<typeof ScreenTransitionsPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
