import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { styles, COLORS } from './ForgotPasswordScreen.styles';

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

      // api/auth.ts 정의 된 내용과 실제 응답 호환성 처리
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
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {step === 1 ? '비밀번호 찾기' : '임시 비밀번호 발급'}
          </Text>
          <Text style={styles.description}>
            {step === 1
              ? '가입하신 이메일 주소로 인증번호를 보내드려요.'
              : '아래 버튼을 누르면 이메일로 임시 비밀번호가 발송됩니다.'}
          </Text>

          {}
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.flex1,
                      (showVerificationInput || isEmailVerified) &&
                        styles.inputDisabled,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                    placeholder="example@email.com"
                    placeholderTextColor={COLORS.darkGray}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={
                      !showVerificationInput && !isEmailVerified && !isLoading
                    }
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    style={[
                      styles.inlineButton,
                      (showVerificationInput || isEmailVerified) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleSendVerificationEmail}
                    disabled={
                      showVerificationInput || isEmailVerified || isLoading
                    }
                  >
                    <Text style={styles.inlineButtonText}>
                      {showVerificationInput ? '전송됨' : '인증요청'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {showVerificationInput && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View style={styles.inlineInputContainer}>
                    <View
                      style={[
                        styles.input,
                        styles.flex1,
                        styles.codeInputWrapper,
                        focusedField === 'verificationCode' &&
                          styles.inputFocused,

                        isEmailVerified && styles.inputDisabled,
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.innerInput,

                          isEmailVerified && { color: COLORS.darkGray },
                        ]}
                        placeholder="123456"
                        placeholderTextColor={COLORS.darkGray}
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading && !isEmailVerified}
                        onFocus={() => setFocusedField('verificationCode')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <Text style={styles.timerText}>
                        {isEmailVerified ? '' : formatTime(timeLeft)}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.inlineButton,
                        (isEmailVerified || isLoading) && styles.buttonDisabled,
                      ]}
                      onPress={handleVerifyCode}
                      disabled={isEmailVerified || isLoading}
                    >
                      <Text style={styles.inlineButtonText}>
                        {isEmailVerified ? '완료' : '확인'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}

          {}
          {step === 2 && (
            <View style={styles.tempPasswordContainer}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>
                  💡 이메일 확인이 완료되었습니다.
                </Text>
                <Text style={styles.infoBoxSubText}>
                  '임시 비밀번호 발송' 버튼을 누르면{'\n'}
                  가입하신 이메일로 비밀번호가 전송됩니다.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {}
        <View style={styles.footer}>
          {step === 1 ? (
            <>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isEmailVerified || isLoading) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleNextStep}
                disabled={!isEmailVerified || isLoading}
              >
                <Text style={styles.submitButtonText}>다음</Text>
              </TouchableOpacity>

              {(showVerificationInput || isEmailVerified) && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={resetVerification}
                  disabled={isLoading}
                >
                  <Text style={styles.retryButtonText}>
                    이메일 다시 입력하기
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSendTempPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>임시 비밀번호 발송</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePrevStep}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>
              {step === 1 ? '로그인 화면으로 돌아가기' : '이전 단계'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
