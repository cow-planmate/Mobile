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
      if (!isEmailVerified) {
        Alert.alert(
          '시간 초과',
          '인증 시간이 만료되었습니다. 다시 시도해주세요.',
        );
        setShowVerificationInput(false);
      }
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
    if (!form.email) return Alert.alert('알림', '이메일을 입력해주세요.');
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/email/verification`, {
        email: form.email,
        purpose: 'SIGN_UP',
      });
      Alert.alert('발송 완료', '인증 번호가 전송되었습니다.');
      setShowVerificationInput(true);
      setIsTimerActive(true);
      setTimeLeft(300);
    } catch (error: any) {
      const msg = error.response?.data?.message || '메일 발송 실패';
      Alert.alert('오류', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.verificationCode)
      return Alert.alert('알림', '인증 번호를 입력해주세요.');
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: form.email,
          verificationCode: parseInt(form.verificationCode, 10),
          purpose: 'SIGN_UP',
        },
      );

      if (response.status === 200) {
        const token = response.data.token;
        if (token) {
          setEmailAuthToken(token);
          setIsEmailVerified(true);
          setIsTimerActive(false);
          Alert.alert('성공', '이메일 인증이 완료되었습니다.');
        } else {
          Alert.alert('오류', '인증 토큰을 받지 못했습니다.');
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || '인증 실패';
      Alert.alert('인증 실패', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckNickname = async () => {
    if (!form.nickname) return Alert.alert('알림', '닉네임을 입력해주세요.');
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register/nickname/verify`,
        {
          nickname: form.nickname,
        },
      );
      if (response.status === 200) {
        setIsNicknameVerified(true);
        Alert.alert('확인 완료', '사용 가능한 닉네임입니다.');
      }
    } catch (error: any) {
      setIsNicknameVerified(false);
      const msg =
        error.response?.data?.message || '이미 사용 중인 닉네임입니다.';
      Alert.alert('사용 불가', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!form.age || !form.gender)
      return Alert.alert('알림', '나이와 성별을 선택해주세요.');

    setIsLoading(true);
    try {
      const genderInt = form.gender === 'male' ? 0 : 1;

      if (!emailAuthToken) {
        Alert.alert(
          '오류',
          '인증 토큰이 없습니다. 처음부터 다시 시도해주세요.',
        );
        return;
      }

      const headers = { Authorization: `Bearer ${emailAuthToken}` };

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          nickname: form.nickname,
          password: form.password,
          gender: genderInt,
          age: parseInt(form.age, 10),
        },
        { headers },
      );

      if (response.status === 200) {
        Alert.alert('가입 성공', '회원가입이 완료되었습니다.', [
          { text: '확인', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      console.error('Signup Error:', error);
      if (error.response?.status === 401) {
        Alert.alert('실패', '인증 세션이 만료되었습니다.');
      } else {
        const msg = error.response?.data?.message || '회원가입 실패';
        Alert.alert('실패', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 단계 이동 로직 ---

  const handleNextStep = () => {
    if (step === 1) {
      if (!isEmailVerified)
        return Alert.alert('알림', '이메일 인증을 완료해주세요.');
      setStep(2);
    } else if (step === 2) {
      if (
        !passwordRequirements.hasMinLength ||
        !passwordRequirements.hasCombination
      ) {
        return Alert.alert('알림', '비밀번호 조건을 만족해주세요.');
      }
      if (form.password !== form.confirmPassword) {
        return Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      }
      setStep(3);
    } else if (step === 3) {
      if (!isNicknameVerified)
        return Alert.alert('알림', '닉네임 중복 확인을 해주세요.');
      setStep(4);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePrevStep}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonIcon}>{'‹'}</Text>
            <Text style={styles.backButtonText}>
              {step === 1 ? '로그인으로' : '이전 단계'}
            </Text>
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {step} / {totalSteps}
            </Text>
          </View>
        </View>

        <ScrollView
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
                      isEmailVerified && styles.inputDisabled,
                    ]}
                    placeholder="example@email.com"
                    value={form.email}
                    onChangeText={v => handleChange('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isEmailVerified && !isLoading}
                  />
                  <Pressable
                    style={[
                      styles.inlineButton,
                      (isEmailVerified || isLoading) && styles.buttonDisabled,
                    ]}
                    onPress={handleSendEmail}
                    disabled={isEmailVerified || isLoading}
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
                        placeholder="6자리 숫자"
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
                    placeholder="••••••••"
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
                    placeholder="••••••••"
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
                    placeholder="닉네임 입력"
                    value={form.nickname}
                    onChangeText={v => handleChange('nickname', v)}
                    editable={!isLoading}
                  />
                  <Pressable
                    style={[
                      styles.inlineButton,
                      (isNicknameVerified || isLoading) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleCheckNickname}
                    disabled={isNicknameVerified || isLoading}
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
                  placeholder="숫자만 입력 (예: 25)"
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

        <View style={styles.footer}>
          {step < 4 ? (
            <Pressable
              style={[
                styles.submitButton,
                // 다음 버튼 비활성화 조건
                (step === 1 && !isEmailVerified) ||
                (step === 2 &&
                  (!passwordRequirements.hasMinLength ||
                    !passwordRequirements.hasCombination ||
                    form.password !== form.confirmPassword)) ||
                (step === 3 && !isNicknameVerified)
                  ? styles.submitButtonDisabled
                  : null,
              ]}
              onPress={handleNextStep}
              disabled={
                (step === 1 && !isEmailVerified) ||
                (step === 2 &&
                  (!passwordRequirements.hasMinLength ||
                    !passwordRequirements.hasCombination ||
                    form.password !== form.confirmPassword)) ||
                (step === 3 && !isNicknameVerified)
              }
            >
              <Text style={styles.submitButtonText}>다음</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.submitButton,
                (isLoading || !form.age || !form.gender) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading || !form.age || !form.gender}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>회원가입 완료</Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBlue },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
  },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  backButtonIcon: {
    fontSize: normalize(24),
    color: COLORS.primary,
    marginRight: 4,
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: normalize(16),
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepIndicator: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  scrollContainer: { padding: normalize(24) },
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
  },
  inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.darkGray },

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
  codeInput: { flex: 1, fontSize: normalize(16), padding: 0 },
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
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
  },
  eyeIcon: { padding: normalize(16) },

  requirementsContainer: { marginTop: normalize(12) },
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

  footer: { padding: normalize(24), paddingTop: 0 },
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
});
