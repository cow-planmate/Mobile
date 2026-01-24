import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { ForgotPasswordScreenView } from './ForgotPasswordScreen.view';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerActive(false);
      resetVerification();
      Alert.alert(
        '시간 초과',
        '인증 시간이 만료되었습니다. 다시 시도해주세요.',
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft]);

  const resetVerification = () => {
    setShowVerificationInput(false);
    setVerificationCode('');
    setIsEmailVerified(false);
    setAuthToken(null);
    setIsTimerActive(false);
    setTimeLeft(300);
  };

  const handleSendVerificationEmail = async () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification`,
        {
          email: email,
          purpose: 'RESET_PASSWORD',
        },
      );

      if (response.data.verificationSent) {
        Alert.alert('발송 완료', '인증번호가 이메일로 전송되었습니다.');
        setShowVerificationInput(true);
        setIsTimerActive(true);
        setTimeLeft(300);
        setIsEmailVerified(false);
      }
    } catch (error: any) {
      console.error('Email Send Error:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '인증 메일 발송에 실패했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: email,
          purpose: 'RESET_PASSWORD',
          verificationCode: parseInt(verificationCode, 10),
        },
      );

      const isVerified =
        response.data.emailVerified || response.data.verifySuccess;

      if (isVerified) {
        const token = response.data.token || response.data.verificationToken;
        Alert.alert('성공', '이메일 인증이 완료되었습니다.');
        setAuthToken(token);
        setIsEmailVerified(true);
        setIsTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        Alert.alert('실패', '인증번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Verify Code Error:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '인증 확인 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && isEmailVerified) {
      setStep(2);
    }
  };

  const handleSendTempPassword = async () => {
    if (!authToken) {
      Alert.alert(
        '오류',
        '인증 세션이 만료되었습니다. 처음부터 다시 시도해주세요.',
      );
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/password/email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      Alert.alert(
        '발송 완료',
        '이메일로 임시 비밀번호가 발송되었습니다.\n\n로그인 후 마이페이지에서 비밀번호를 꼭 변경해주세요.',
        [
          {
            text: '로그인하러 가기',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      console.error('Send Temp Password Error:', error);
      const status = error.response?.status;
      const message = error.response?.data?.message || '';

      if (status === 403) {
        Alert.alert(
          '권한 오류',
          '임시 비밀번호 발급 권한이 없습니다.\n(서버 설정을 확인해주세요.)',
        );
      } else {
        Alert.alert('오류', message || '임시 비밀번호 발송에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <ForgotPasswordScreenView
      step={step}
      totalSteps={totalSteps}
      email={email}
      verificationCode={verificationCode}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isLoading={isLoading}
      focusedField={focusedField}
      timeLeft={timeLeft}
      onEmailChange={setEmail}
      onVerificationCodeChange={setVerificationCode}
      onSendVerificationEmail={handleSendVerificationEmail}
      onVerifyCode={handleVerifyCode}
      onNextStep={handleNextStep}
      onSendTempPassword={handleSendTempPassword}
      onPrevStep={handlePrevStep}
      onResetVerification={resetVerification}
      setFocusedField={setFocusedField}
      formatTime={formatTime}
    />
  );
};

export default ForgotPasswordScreen;
