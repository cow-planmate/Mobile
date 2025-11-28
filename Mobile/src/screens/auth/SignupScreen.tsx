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
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  PixelRatio,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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

// 타이머 포맷 함수
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default function SignupScreen() {
  const navigation = useNavigation<any>();

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
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

  // 1. 인증 메일 발송
  const handleSendEmail = async () => {
    if (!form.email) return Alert.alert('알림', '이메일을 입력해주세요.');

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/email/verification`, {
        email: form.email,
        purpose: 'SIGN_UP',
      });

      Alert.alert('발송 완료', '인증 번호가 이메일로 전송되었습니다.');
      setShowVerificationInput(true);
      setIsTimerActive(true);
      setTimeLeft(300);
    } catch (error: any) {
      const msg = error.response?.data?.message || '메일 발송에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 인증 번호 확인 [수정됨]
  const handleVerifyCode = async () => {
    if (!form.verificationCode)
      return Alert.alert('알림', '인증 번호를 입력해주세요.');

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: form.email,
          verificationCode: parseInt(form.verificationCode, 10), // 숫자로 변환
          purpose: 'SIGN_UP',
        },
      );

      if (response.status === 200) {
        // [수정 핵심] 백엔드 DTO(EmailVerificationResponse)의 필드명은 'token'입니다.
        const token = response.data.token;

        if (token) {
          setEmailAuthToken(token);
          setIsEmailVerified(true);
          setIsTimerActive(false);
          Alert.alert('성공', '이메일 인증이 완료되었습니다.');
        } else {
          console.log('Token not found in response:', response.data);
          Alert.alert('오류', '서버에서 인증 토큰을 받지 못했습니다.');
        }
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || '인증 번호가 올바르지 않습니다.';
      Alert.alert('인증 실패', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!form.nickname) return Alert.alert('알림', '닉네임을 입력해주세요.');

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register/nickname/verify`, {
        nickname: form.nickname,
      });
      setIsNicknameVerified(true);
      Alert.alert('사용 가능', '사용 가능한 닉네임입니다.');
    } catch (error: any) {
      setIsNicknameVerified(false);
      const msg =
        error.response?.data?.message || '이미 사용 중인 닉네임입니다.';
      Alert.alert('사용 불가', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 최종 회원가입
  const handleSignup = async () => {
    if (!isEmailVerified)
      return Alert.alert('알림', '이메일 인증을 완료해주세요.');
    if (!isNicknameVerified)
      return Alert.alert('알림', '닉네임 중복 확인을 해주세요.');
    if (!form.password || !form.confirmPassword)
      return Alert.alert('알림', '비밀번호를 입력해주세요.');
    if (form.password !== form.confirmPassword)
      return Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
    if (
      !passwordRequirements.hasMinLength ||
      !passwordRequirements.hasCombination
    ) {
      return Alert.alert('오류', '비밀번호 요구사항을 충족해주세요.');
    }
    if (!form.age || !form.gender)
      return Alert.alert('알림', '나이와 성별을 선택해주세요.');

    setIsLoading(true);
    try {
      const genderInt = form.gender === 'male' ? 1 : 2;

      // 헤더에 토큰 설정
      const headers = emailAuthToken
        ? { Authorization: `Bearer ${emailAuthToken}` }
        : undefined;

      console.log('Signup Request Headers:', headers); // 디버깅용 로그

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
        Alert.alert('가입 성공', '회원가입이 완료되었습니다. 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      console.error('Signup Error:', error);
      // 401 에러 구체화
      if (error.response?.status === 401) {
        Alert.alert(
          '가입 실패',
          '인증 세션이 만료되었습니다. 이메일 인증을 다시 진행해주세요.',
        );
      } else {
        const msg = error.response?.data?.message || '회원가입에 실패했습니다.';
        Alert.alert('가입 실패', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = useMemo(() => {
    const hasMinLength = form.password.length >= 8;
    const hasCombination = /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(
      form.password,
    );
    return { hasMinLength, hasCombination };
  }, [form.password]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonIcon}>{'‹'}</Text>
            <Text style={styles.backButtonText}>뒤로가기</Text>
          </TouchableOpacity>

          <Text style={styles.title}>회원가입</Text>

          {/* 이메일 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inlineInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.flex1,
                  focusedInput === 'email' && styles.inputFocused,
                  isEmailVerified && styles.inputDisabled,
                ]}
                placeholder="이메일을 입력하세요"
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
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
                  {isEmailVerified ? '인증완료' : '인증번호발송'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 인증번호 */}
          {showVerificationInput && !isEmailVerified && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>인증번호</Text>
              <View style={styles.inlineInputContainer}>
                <View
                  style={[styles.input, styles.flex1, styles.codeInputWrapper]}
                >
                  <TextInput
                    style={styles.codeInput}
                    placeholder="인증번호 6자리"
                    value={form.verificationCode}
                    onChangeText={v => handleChange('verificationCode', v)}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
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

          {/* 비밀번호 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'password' && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={form.password}
                placeholder="••••••••"
                placeholderTextColor={COLORS.darkGray}
                onChangeText={v => handleChange('password', v)}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
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
                label="최소 8자"
              />
              <PasswordRequirement
                met={passwordRequirements.hasCombination}
                label="영문, 숫자, 특수문자 3가지 조합"
              />
            </View>
          </View>

          {/* 비밀번호 재입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호 재입력</Text>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'confirmPassword' && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={form.confirmPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.darkGray}
                onChangeText={v => handleChange('confirmPassword', v)}
                secureTextEntry={!isConfirmPasswordVisible}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsConfirmPasswordVisible(v => !v)}
              >
                <Text>{isConfirmPasswordVisible ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 닉네임 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            <View style={styles.inlineInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.flex1,
                  focusedInput === 'nickname' && styles.inputFocused,
                ]}
                placeholder="닉네임을 입력하세요"
                value={form.nickname}
                onChangeText={v => handleChange('nickname', v)}
                onFocus={() => setFocusedInput('nickname')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
              />
              <Pressable
                style={[
                  styles.inlineButton,
                  (isNicknameVerified || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleCheckNickname}
                disabled={isNicknameVerified || isLoading}
              >
                <Text style={styles.inlineButtonText}>
                  {isNicknameVerified ? '확인완료' : '중복확인'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 나이/성별 */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>나이</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'age' && styles.inputFocused,
                ]}
                value={form.age}
                onChangeText={v => handleChange('age', v)}
                keyboardType="number-pad"
                onFocus={() => setFocusedInput('age')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
                placeholder="숫자만 입력"
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderContainer}>
                <Pressable
                  style={[
                    styles.genderButton,
                    form.gender === 'male' && styles.genderButtonSelected,
                  ]}
                  onPress={() => handleChange('gender', 'male')}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      form.gender === 'male' && styles.genderButtonTextSelected,
                    ]}
                  >
                    남
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderButton,
                    form.gender === 'female' && styles.genderButtonSelected,
                  ]}
                  onPress={() => handleChange('gender', 'female')}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      form.gender === 'female' &&
                        styles.genderButtonTextSelected,
                    ]}
                  >
                    여
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>회원가입</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.lightBlue },
  scrollContainer: {
    padding: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: normalize(40),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: normalize(48),
    color: COLORS.text,
    marginTop: normalize(24),
    letterSpacing: 1,
  },
  inputGroup: { width: '100%', marginBottom: normalize(24) },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(10),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  input: {
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
  },
  inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.darkGray },
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
  passwordInput: {
    flex: 1,
    height: normalize(52),
    borderWidth: 0,
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: 'transparent',
  },
  inputFocused: { borderColor: COLORS.primary, borderWidth: 1.5 },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    minWidth: normalize(80),
  },
  buttonDisabled: {
    backgroundColor: COLORS.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  inlineButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  eyeIcon: { padding: normalize(15) },
  rowContainer: { flexDirection: 'row', gap: normalize(20) },
  genderContainer: {
    flexDirection: 'row',
    height: normalize(52),
    gap: normalize(10),
  },
  genderButton: {
    flex: 1,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontWeight: 'bold',
    color: COLORS.darkGray,
    fontSize: normalize(16),
  },
  genderButtonTextSelected: { color: COLORS.white },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(40),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: { backgroundColor: COLORS.darkGray },
  submitButtonText: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  requirementsContainer: { marginTop: normalize(10) },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  requirementIcon: {
    marginRight: normalize(10),
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  requirementText: { fontSize: normalize(14) },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(24),
    marginLeft: normalize(16),
    marginBottom: normalize(10),
    width: normalize(100),
  },
  backButtonIcon: {
    fontSize: normalize(24),
    color: COLORS.primary,
    marginRight: normalize(4),
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: normalize(16),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
