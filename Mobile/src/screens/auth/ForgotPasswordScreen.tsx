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

// 스타일 변수 및 normalize 함수
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
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 포커스 상태 관리 추가
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 타이머 관련 상태
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
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

  const resetScreen = () => {
    setShowVerificationInput(false);
    setVerificationCode('');
    setIsTimerActive(false);
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // 1. 인증 메일 발송 요청
  const handleSendVerificationEmail = async () => {
    // [개발 모드] 즉시 성공 처리
    Alert.alert('개발 모드', '인증 메일이 발송된 것으로 처리합니다.');
    setShowVerificationInput(true);
    setIsTimerActive(true);
    setTimeLeft(300);

    /* 실제 API 로직
    if (!email) return Alert.alert('알림', '이메일을 입력해주세요.');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/email/verification`, {
        email: email,
        purpose: 'RESET_PASSWORD',
      });
      if (response.status === 200) {
        Alert.alert('발송 성공', '인증 메일이 발송되었습니다.');
        setShowVerificationInput(true);
        setIsTimerActive(true);
        setTimeLeft(300);
      }
    } catch (error: any) {
      Alert.alert('발송 실패', error.response?.data?.message || '오류 발생');
    } finally {
      setIsLoading(false);
    }
    */
  };

  // 2. 인증 번호 확인 요청
  const handleVerifyCode = async () => {
    // [개발 모드] 즉시 성공 처리 및 로그인 화면 이동
    if (timerRef.current) clearInterval(timerRef.current);
    Alert.alert('개발 모드', '인증이 완료되었습니다.', [
      {
        text: '확인',
        onPress: () => navigation.navigate('Login'),
      },
    ]);

    /* 실제 API 로직
    if (verificationCode.length !== 6) return Alert.alert('알림', '인증 번호를 확인해주세요.');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/email/verification/confirm`, {
        email: email,
        purpose: 'RESET_PASSWORD',
        verificationCode: verificationCode,
      });
      if (response.status === 200) {
        if (timerRef.current) clearInterval(timerRef.current);
        Alert.alert('인증 성공', '완료되었습니다.', [
          { text: '확인', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      Alert.alert('인증 실패', '인증 번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
    */
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* [수정] 텍스트 정렬 및 크기를 회원가입 화면과 동일하게 변경 */}
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
                focusedField === 'email' && styles.inputFocused,
              ]}
              placeholder="example@email.com" // [수정] 플레이스홀더 변경
              placeholderTextColor={COLORS.darkGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!showVerificationInput && !isLoading}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {showVerificationInput && (
            <View style={styles.inputGroup}>
              {/* [수정] 라벨 텍스트 변경: "인증 번호" -> "인증번호" */}
              <Text style={styles.label}>인증번호</Text>
              <View
                style={[
                  styles.codeInputWrapper,
                  styles.input, // Wrapper에 기본 input 스타일 적용
                  focusedField === 'verificationCode' && styles.inputFocused, // 포커스 시 두께 2 적용됨
                ]}
              >
                <TextInput
                  style={styles.innerInput}
                  placeholder="123456" // [수정] 플레이스홀더 변경
                  placeholderTextColor={COLORS.darkGray}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  onFocus={() => setFocusedField('verificationCode')}
                  onBlur={() => setFocusedField(null)}
                />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  scrollContent: {
    padding: normalize(24),
    paddingBottom: normalize(100),
  },
  // [수정] 타이틀 스타일: 왼쪽 정렬, 폰트 크기 28, 마진 조정
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(8),
    marginTop: normalize(20), // 상단 여백
    textAlign: 'left',
  },
  // [수정] 설명 텍스트 스타일: 왼쪽 정렬, 폰트 크기 15, 마진 조정
  description: {
    fontSize: normalize(15),
    color: COLORS.darkGray,
    marginBottom: normalize(32),
    textAlign: 'left',
    lineHeight: normalize(22), // 가독성을 위해 줄간격 살짝 조정
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(24), // 간격 조정
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
    borderRadius: normalize(12), // 둥근 모서리 조정 (회원가입과 통일)
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
  // 포커스 시 테두리 스타일 (두께 2 유지)
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.darkGray,
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
  },
  innerInput: {
    flex: 1,
    fontSize: normalize(16),
    color: COLORS.text,
    height: '100%',
  },
  timerText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  footer: {
    padding: normalize(24),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'flex-end',
  },
  submitButton: {
    width: '100%',
    height: normalize(56), // 버튼 높이 조정 (회원가입과 통일)
    borderRadius: normalize(28), // 둥근 모서리 조정
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, // 그림자 조정
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: normalize(18), // 폰트 크기 조정
    fontWeight: 'bold',
    color: COLORS.white,
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
    padding: normalize(12),
    marginTop: normalize(12), // 여백 조정
  },
  backButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
