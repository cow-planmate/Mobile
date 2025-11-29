import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  PixelRatio,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  success: '#34C759',
  error: '#FF3B30',
  lightBlue: '#e6f0ff',
};

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

export default function SignupScreen() {
  const navigation = useNavigation<any>();

  // 단계 관리 (1: 이메일, 2: 비밀번호, 3: 닉네임, 4: 정보)
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    gender: '',
    age: '',
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 인증 상태
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [emailAuthToken, setEmailAuthToken] = useState<string | null>(null);

  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'nickname') setIsNicknameVerified(false);
    if (name === 'email') {
      setIsEmailVerified(false);
      setShowVerificationInput(false);
      setEmailAuthToken(null);
      resetTimer();
    }
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeLeft, isEmailVerified]);

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(300);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // --- API 핸들러 ---

  const handleSendEmail = async () => {
    // 개발 모드
    Alert.alert('개발 모드', '인증 번호가 전송된 것으로 처리합니다.');
    setShowVerificationInput(true);
    setIsTimerActive(true);
    setTimeLeft(300);
  };

  const handleVerifyCode = async () => {
    // 개발 모드
    Alert.alert('개발 모드', '이메일 인증이 완료된 것으로 처리합니다.');
    setEmailAuthToken('dummy_token_for_dev');
    setIsEmailVerified(true);
    setIsTimerActive(false);
  };

  const handleCheckNickname = async () => {
    // 개발 모드
    setIsNicknameVerified(true);
    Alert.alert('개발 모드', '사용 가능한 닉네임으로 처리합니다.');
  };

  const handleSignup = async () => {
    // 개발 모드
    Alert.alert('개발 모드', '회원가입이 완료된 것으로 처리합니다.', [
      { text: '확인', onPress: () => navigation.navigate('Login') },
    ]);
  };

  // --- 단계 이동 로직 ---

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const passwordRequirements = useMemo(() => {
    const hasMinLength = form.password.length >= 8;
    const hasCombination = /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(
      form.password,
    );
    return { hasMinLength, hasCombination };
  }, [form.password]);

  // --- UI 렌더링 ---

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header: 상단 고정 */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
        </View>
      </View>

      {/* 2. Content: 입력 폼 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {step === 1 && '이메일 인증'}
            {step === 2 && '비밀번호 설정'}
            {step === 3 && '닉네임 설정'}
            {step === 4 && '내 정보 입력'}
          </Text>

          {/* STEP 1: 이메일 */}
          {step === 1 && (
            <>
              <Text style={styles.description}>
                로그인에 사용할 이메일을 인증해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    placeholder="example@email.com"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.email}
                    onChangeText={v => handleChange('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Pressable
                    style={styles.inlineButton}
                    onPress={handleSendEmail}
                  >
                    <Text style={styles.inlineButtonText}>
                      {isEmailVerified ? '완료' : '인증요청'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {showVerificationInput && !isEmailVerified && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View style={styles.inlineInputContainer}>
                    <View
                      style={[
                        styles.input,
                        styles.flex1,
                        styles.codeInputWrapper,
                      ]}
                    >
                      <TextInput
                        style={styles.codeInput}
                        placeholder="123456"
                        placeholderTextColor={COLORS.darkGray}
                        value={form.verificationCode}
                        onChangeText={v => handleChange('verificationCode', v)}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading}
                      />
                      <Text style={styles.timerText}>
                        {formatTime(timeLeft)}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.inlineButton,
                        isLoading && styles.buttonDisabled,
                      ]}
                      onPress={handleVerifyCode}
                      disabled={isLoading}
                    >
                      <Text style={styles.inlineButtonText}>확인</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}

          {/* STEP 2: 비밀번호 */}
          {step === 2 && (
            <>
              <Text style={styles.description}>
                안전한 비밀번호를 설정해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={form.password}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={v => handleChange('password', v)}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(v => !v)}
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
                <Text style={styles.label}>비밀번호 확인</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={form.confirmPassword}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={v => handleChange('confirmPassword', v)}
                    secureTextEntry={!isConfirmPasswordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsConfirmPasswordVisible(v => !v)}
                  >
                    <Text>{isConfirmPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* STEP 3: 닉네임 */}
          {step === 3 && (
            <>
              <Text style={styles.description}>
                앱에서 사용할 닉네임을 정해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>닉네임</Text>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    placeholder="플랜메이트"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.nickname}
                    onChangeText={v => handleChange('nickname', v)}
                    editable={!isLoading}
                  />
                  <Pressable
                    style={styles.inlineButton}
                    onPress={handleCheckNickname}
                  >
                    <Text style={styles.inlineButtonText}>
                      {isNicknameVerified ? '사용가능' : '중복확인'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* STEP 4: 내 정보 */}
          {step === 4 && (
            <>
              <Text style={styles.description}>
                맞춤형 여행 계획을 위해 필요해요.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>나이</Text>
                <TextInput
                  style={styles.input}
                  value={form.age}
                  onChangeText={v => handleChange('age', v)}
                  keyboardType="number-pad"
                  placeholder="25"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>성별</Text>
                <View style={styles.genderContainer}>
                  <Pressable
                    style={[
                      styles.genderButton,
                      form.gender === 'male' && styles.genderButtonSelected,
                    ]}
                    onPress={() => handleChange('gender', 'male')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        form.gender === 'male' &&
                          styles.genderButtonTextSelected,
                      ]}
                    >
                      남성
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.genderButton,
                      form.gender === 'female' && styles.genderButtonSelected,
                    ]}
                    onPress={() => handleChange('gender', 'female')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        form.gender === 'female' &&
                          styles.genderButtonTextSelected,
                      ]}
                    >
                      여성
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. Footer: 하단 고정 */}
      <View style={styles.footer}>
        {step < 4 ? (
          <Pressable style={styles.submitButton} onPress={handleNextStep}>
            <Text style={styles.submitButtonText}>다음</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.submitButton} onPress={handleSignup}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>회원가입 완료</Text>
            )}
          </Pressable>
        )}
        <TouchableOpacity
          style={styles.bottomBackButton}
          onPress={handlePrevStep}
          disabled={isLoading}
        >
          <Text style={styles.bottomBackButtonText}>
            {step === 1 ? '로그인 화면으로 돌아가기' : '이전 단계'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBlue },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20), // 상태바 겹침 방지 여백
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
  scrollContainer: { padding: normalize(24), paddingBottom: normalize(100) }, // 하단 여백 추가
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  description: {
    fontSize: normalize(15),
    color: COLORS.darkGray,
    marginBottom: normalize(32),
  },
  inputGroup: { marginBottom: normalize(24) },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  input: {
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    color: COLORS.text, // 색상 추가
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  flex1: { flex: 1 },
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: normalize(80),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: { backgroundColor: COLORS.darkGray },
  inlineButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeInput: {
    flex: 1,
    fontSize: normalize(16),
    padding: 0,
    color: COLORS.text,
  }, // 색상 추가
  timerText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
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
    color: COLORS.text, // 색상 추가
  },
  eyeIcon: { padding: normalize(16) },
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
  genderContainer: { flexDirection: 'row', gap: normalize(12) },
  genderButton: {
    flex: 1,
    height: normalize(52),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  genderButtonTextSelected: { color: COLORS.white },
  footer: { padding: normalize(24), backgroundColor: COLORS.lightBlue },
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
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bottomBackButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(12),
  },
  bottomBackButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
});
