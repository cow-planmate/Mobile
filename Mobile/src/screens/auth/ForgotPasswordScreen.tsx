import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  PixelRatio,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';

// 스타일 변수 및 normalize 함수 (LoginScreen과 동일)
const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  secondary: '#5AC8FA',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  error: '#FF3B30',
  lightBlue: '#e6f0ff',
};

// 이메일 정규식
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();

  // 상태 관리
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 인증 번호 저장
  const [showVerificationInput, setShowVerificationInput] = useState(false); // 인증 필드 표시 여부
  const [isLoading, setIsLoading] = useState(false);

  // 타이머 관련 상태
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 시간 초과 시
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerActive(false);
      Alert.alert(
        '시간 초과',
        '인증 시간이 만료되었습니다. 다시 시도해주세요.',
        [{ text: '확인', onPress: resetScreen }],
      );
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft]);

  // 화면 초기화 함수
  const resetScreen = () => {
    setShowVerificationInput(false);
    setVerificationCode('');
    setIsTimerActive(false);
    setTimeLeft(300);
  };

  // 시간 포맷 (MM:SS) 변환 함수
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // 1. 인증 메일 발송 요청
  const handleSendVerificationEmail = async () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(`메일 발송 요청: ${API_URL}/api/auth/email/verification`);

      const response = await axios.post(
        `${API_URL}/api/auth/email/verification`,
        {
          email: email,
          purpose: 'RESET_PASSWORD',
        },
      );

      if (response.status === 200) {
        Alert.alert(
          '발송 성공',
          '인증 메일이 발송되었습니다.\n인증 번호를 입력해주세요.',
        );
        setShowVerificationInput(true); // 인증 필드 보여주기
        setIsTimerActive(true); // 타이머 시작
        setTimeLeft(300); // 5분 리셋
      }
    } catch (error: any) {
      console.error('메일 발송 실패:', error);
      let errorMessage = '이메일 발송에 실패했습니다.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('발송 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 인증 번호 확인 요청
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('알림', '인증 번호 6자리를 정확히 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        `인증 확인 요청: ${API_URL}/api/auth/email/verification/confirm`,
      );

      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: email,
          purpose: 'RESET_PASSWORD',
          verificationCode: verificationCode, // 사용자가 입력한 코드
        },
      );

      if (response.status === 200) {
        // 타이머 정지
        if (timerRef.current) clearInterval(timerRef.current);

        Alert.alert('인증 성공', '이메일 인증이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // TODO: 비밀번호 재설정 화면으로 이동하거나, 다음 로직을 여기에 추가
              // 예: navigation.navigate('ResetPassword', { email: email });
              navigation.navigate('Login');
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('인증 실패:', error);
      Alert.alert('인증 실패', '인증 번호가 올바르지 않거나 만료되었습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>비밀번호 찾기</Text>
          <Text style={styles.description}>
            가입하신 이메일 주소로 인증번호를 보내드려요. 인증번호를 입력하시면
            비밀번호 재설정이 가능합니다.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={[
                styles.input,
                showVerificationInput && styles.inputDisabled,
              ]}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={COLORS.darkGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!showVerificationInput && !isLoading}
            />
          </View>
          {showVerificationInput && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>인증 번호</Text>
              <View style={styles.codeInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="인증 번호 6자리"
                  placeholderTextColor={COLORS.darkGray}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          )}
          {!showVerificationInput ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSendVerificationEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>인증 요청</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>인증 확인</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetScreen}
                disabled={isLoading}
              >
                <Text style={styles.retryButtonText}>이메일 다시 입력하기</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>로그인 화면으로 돌아가기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(13),
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: normalize(24),
    lineHeight: normalize(19),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(24),
    backgroundColor: COLORS.lightBlue,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: normalize(24),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: normalize(32),
    color: COLORS.text,
    letterSpacing: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(18),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  input: {
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 0,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.darkGray,
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerText: {
    position: 'absolute',
    right: normalize(16),
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(12),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  retryButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(8),
  },
  retryButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    padding: normalize(16),
    marginTop: normalize(18),
  },
  backButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
