import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  SafeAreaView, // [수정] react-native 내장 컴포넌트로 변경 (SignupScreen과 통일)
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // 제거
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
  success: '#34C759',
  error: '#FF3B30',
  lightBlue: '#e6f0ff',
};

// 비밀번호 조건 체크 컴포넌트
const PasswordRequirement = React.memo(
  ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.requirementRow}>
      <Text
        style={[
          styles.requirementIcon,
          { color: met ? COLORS.success : COLORS.darkGray },
        ]}
      >
        ✓
      </Text>
      <Text
        style={[
          styles.requirementText,
          { color: met ? COLORS.text : COLORS.darkGray },
        ]}
      >
        {label}
      </Text>
    </View>
  ),
);

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();

  // 단계 관리 (1: 이메일 인증, 2: 비밀번호 재설정)
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1 상태
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // Step 2 상태
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 타이머 상태
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
        [{ text: '확인', onPress: resetVerification }],
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft]);

  const resetVerification = () => {
    setShowVerificationInput(false);
    setVerificationCode('');
    setIsTimerActive(false);
    setTimeLeft(300);
  };

  // 비밀번호 유효성 검사
  const passwordRequirements = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasCombination = /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(
      newPassword,
    );
    return { hasMinLength, hasCombination };
  }, [newPassword]);

  const isPasswordMatch = useMemo(() => {
    return confirmNewPassword.length > 0 && newPassword === confirmNewPassword;
  }, [newPassword, confirmNewPassword]);

  // --- 핸들러 ---

  const handleSendVerificationEmail = async () => {
    Alert.alert('개발 모드', '인증 메일이 발송된 것으로 처리합니다.');
    setShowVerificationInput(true);
    setIsTimerActive(true);
    setTimeLeft(300);
  };

  const handleVerifyCode = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    Alert.alert(
      '개발 모드',
      '인증이 완료되었습니다. 비밀번호를 재설정해주세요.',
      [{ text: '확인', onPress: () => setStep(2) }],
    );
  };

  const handleResetPassword = async () => {
    Alert.alert('개발 모드', '비밀번호가 성공적으로 변경되었습니다.', [
      { text: '로그인하러 가기', onPress: () => navigation.navigate('Login') },
    ]);
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
      {/* 상단 헤더 & 단계 표시 */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }} // flex: 1 추가하여 하단 버튼 고정
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {step === 1 ? '비밀번호 찾기' : '비밀번호 재설정'}
          </Text>
          <Text style={styles.description}>
            {step === 1
              ? '가입하신 이메일 주소로 인증번호를 보내드려요.'
              : '새로운 비밀번호를 입력해주세요.'}
          </Text>

          {/* === STEP 1: 이메일 인증 === */}
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <TextInput
                  style={[
                    styles.input,
                    showVerificationInput && styles.inputDisabled,
                    focusedField === 'email' && styles.inputFocused,
                  ]}
                  placeholder="example@email.com"
                  placeholderTextColor={COLORS.darkGray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!showVerificationInput && !isLoading}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {showVerificationInput && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View
                    style={[
                      styles.codeInputWrapper,
                      styles.input,
                      focusedField === 'verificationCode' &&
                        styles.inputFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.innerInput}
                      placeholder="123456"
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
            </>
          )}

          {/* === STEP 2: 비밀번호 재설정 === */}
          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'newPassword' && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={setNewPassword}
                    secureTextEntry={!isPasswordVisible}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Text>{isPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={passwordRequirements.hasMinLength}
                    label="최소 8자 이상"
                  />
                  <PasswordRequirement
                    met={passwordRequirements.hasCombination}
                    label="영문, 숫자, 특수문자 포함"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호 확인</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'confirmNewPassword' &&
                      styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmNewPassword}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                    onFocus={() => setFocusedField('confirmNewPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                  >
                    <Text>{isConfirmPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={isPasswordMatch}
                    label="비밀번호 일치"
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* === 하단 버튼 영역 (Footer) === */}
        <View style={styles.footer}>
          {step === 1 ? (
            !showVerificationInput ? (
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
                    <Text style={styles.submitButtonText}>다음</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={resetVerification}
                  disabled={isLoading}
                >
                  <Text style={styles.retryButtonText}>
                    이메일 다시 입력하기
                  </Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            // Step 2 버튼
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>비밀번호 변경 완료</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  // 헤더 스타일 (회원가입과 동일)
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(10),
    marginTop: normalize(10),
  },
  stepIndicator: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stepText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: normalize(24),
    paddingBottom: normalize(100),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(8),
    textAlign: 'left',
  },
  description: {
    fontSize: normalize(15),
    color: COLORS.darkGray,
    marginBottom: normalize(32),
    textAlign: 'left',
    lineHeight: normalize(22),
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(24),
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
    borderRadius: normalize(12),
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
  // 비밀번호 입력 컨테이너 스타일 (Signup과 동일)
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(12),
    height: normalize(52),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    color: COLORS.text,
  },
  eyeIcon: {
    padding: normalize(16),
  },
  requirementsContainer: {
    marginTop: normalize(12),
    marginLeft: normalize(10),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  requirementIcon: {
    marginRight: normalize(8),
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  requirementText: { fontSize: normalize(13) },

  // Footer
  footer: {
    padding: normalize(24),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'flex-end',
  },
  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
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
    fontSize: normalize(18),
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
    marginTop: normalize(12),
  },
  backButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
