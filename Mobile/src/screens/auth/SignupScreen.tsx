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

  // 포커스 상태 관리
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  // --- API 핸들러 (수정됨) ---
  const handleSendEmail = async () => {
    if (!form.email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    // 이메일 유효성 검사 (간단한 형식 체크)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    try {
      // [수정] 개발 모드 Alert 제거 및 실제 API 호출
      // 백엔드 Enum: EmailVerificationPurpose.SIGN_UP
      await axios.post(`${API_URL}/api/auth/email/verification`, {
        email: form.email,
        purpose: 'SIGN_UP',
      });
      Alert.alert(
        '성공',
        '인증 번호가 이메일로 전송되었습니다.\n(스팸 메일함도 확인해주세요)',
      );
      setShowVerificationInput(true);
      setIsTimerActive(true);
      setTimeLeft(300);
    } catch (error: any) {
      console.error('Email Send Error:', error);
      const message =
        error.response?.data?.message ||
        '인증 번호 전송에 실패했습니다.\n네트워크 상태를 확인해주세요.';
      Alert.alert('오류', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.verificationCode) {
      Alert.alert('알림', '인증 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // [수정] 실제 인증 코드 확인 API 호출
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: form.email,
          purpose: 'SIGN_UP',
          verificationCode: parseInt(form.verificationCode, 10), // 백엔드는 int형을 기대함
        },
      );

      if (response.data.emailVerified) {
        Alert.alert('성공', '이메일 인증이 완료되었습니다.');
        setEmailAuthToken(response.data.token); // 회원가입 시 사용할 토큰 저장
        setIsEmailVerified(true);
        setIsTimerActive(false);
      } else {
        Alert.alert('실패', '인증 번호가 올바르지 않습니다.');
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

  const handleCheckNickname = async () => {
    if (!form.nickname) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    try {
      // [수정] 닉네임 중복 확인 API 호출
      const response = await axios.post(
        `${API_URL}/api/auth/register/nickname/verify`,
        {
          nickname: form.nickname,
        },
      );

      if (response.data.nicknameAvailable) {
        setIsNicknameVerified(true);
        Alert.alert('사용 가능', '사용 가능한 닉네임입니다.');
      } else {
        setIsNicknameVerified(false);
        Alert.alert('사용 불가', '이미 사용 중인 닉네임입니다.');
      }
    } catch (error: any) {
      console.error('Nickname Check Error:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '닉네임 확인에 실패했습니다.',
      );
    }
  };

  const handleSignup = async () => {
    // 필수 정보 입력 확인
    if (
      !form.email ||
      !isEmailVerified ||
      !form.password ||
      !form.nickname ||
      !form.age ||
      !form.gender
    ) {
      Alert.alert('알림', '모든 정보를 입력하고 인증을 완료해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 성별 변환 (백엔드: int gender) - 남성: 0, 여성: 1 (예시 매핑, 백엔드 로직에 따름)
      const genderInt = form.gender === 'male' ? 0 : 1;

      // [수정] 회원가입 API 호출
      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          nickname: form.nickname,
          password: form.password,
          gender: genderInt,
          age: parseInt(form.age, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${emailAuthToken}`,
          },
        },
      );

      Alert.alert('환영합니다!', '회원가입이 성공적으로 완료되었습니다.', [
        {
          text: '로그인하러 가기',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      console.error('Signup Error:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '회원가입에 실패했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
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

  // 비밀번호 일치 여부 확인 로직
  const isPasswordMatch = useMemo(() => {
    return (
      form.confirmPassword.length > 0 && form.password === form.confirmPassword
    );
  }, [form.password, form.confirmPassword]);

  // --- UI 렌더링 ---
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
        </View>
      </View>

      {/* 2. Content */}
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
                    style={[
                      styles.input,
                      styles.flex1,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                    placeholder="example@email.com"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.email}
                    onChangeText={v => handleChange('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
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
                        focusedField === 'verificationCode' &&
                          styles.inputFocused,
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
                        onFocus={() => setFocusedField('verificationCode')}
                        onBlur={() => setFocusedField(null)}
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
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'password' && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={form.password}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={v => handleChange('password', v)}
                    secureTextEntry={!isPasswordVisible}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
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
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={form.confirmPassword}
                    placeholder="********"
                    placeholderTextColor={COLORS.darkGray}
                    onChangeText={v => handleChange('confirmPassword', v)}
                    secureTextEntry={!isConfirmPasswordVisible}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsConfirmPasswordVisible(v => !v)}
                  >
                    <Text>{isConfirmPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {/* [수정] 문구 변경: "비밀번호가 일치합니다" -> "비밀번호 일치" */}
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={isPasswordMatch}
                    label="비밀번호 일치"
                  />
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
                    style={[
                      styles.input,
                      styles.flex1,
                      focusedField === 'nickname' && styles.inputFocused,
                    ]}
                    placeholder="플랜메이트"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.nickname}
                    onChangeText={v => handleChange('nickname', v)}
                    editable={!isLoading}
                    onFocus={() => setFocusedField('nickname')}
                    onBlur={() => setFocusedField(null)}
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
                  style={[
                    styles.input,
                    focusedField === 'age' && styles.inputFocused,
                  ]}
                  value={form.age}
                  onChangeText={v => handleChange('age', v)}
                  keyboardType="number-pad"
                  placeholder="25"
                  placeholderTextColor={COLORS.darkGray}
                  onFocus={() => setFocusedField('age')}
                  onBlur={() => setFocusedField(null)}
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

      {/* 3. Footer */}
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
  scrollContainer: { padding: normalize(24), paddingBottom: normalize(100) },
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
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
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
  },
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
    color: COLORS.text,
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
