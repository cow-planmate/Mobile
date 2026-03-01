import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { SignupScreenView } from './SignupScreen.view';
import { useAuth } from '../../contexts/AuthContext';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { login, setNeedsThemeSelection } = useAuth();

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

  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [emailAuthToken, setEmailAuthToken] = useState<string | null>(null);

  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);

  const [isAgeModalVisible, setAgeModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'nickname') setIsNicknameVerified(false);

    if (name === 'email') {
      setIsEmailDuplicate(false);
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
  }, [isTimerActive, timeLeft]);

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(300);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResetEmail = () => {
    setIsEmailVerified(false);
    setShowVerificationInput(false);
    setEmailAuthToken(null);
    setIsEmailDuplicate(false);
    resetTimer();
    setForm(prev => ({ ...prev, verificationCode: '' }));
  };

  const handleSendEmail = async () => {
    if (!form.email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    setIsEmailDuplicate(false);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification`,
        {
          email: form.email,
          purpose: 'SIGN_UP',
        },
      );

      if (response.data.verificationSent) {
        Alert.alert(
          '성공',
          '인증 번호가 이메일로 전송되었습니다.\n(스팸 메일함도 확인해주세요)',
        );
        setShowVerificationInput(true);
        setIsTimerActive(true);
        setTimeLeft(300);
      }
    } catch (error: any) {
      console.error('Email Send Error:', error);
      const status = error.response?.status;
      const message =
        error.response?.data?.message || '인증 번호 전송에 실패했습니다.';

      if (message.includes('exist') || status === 409) {
        setIsEmailDuplicate(true);
      } else {
        Alert.alert('오류', message);
      }
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
      const response = await axios.post(
        `${API_URL}/api/auth/email/verification/confirm`,
        {
          email: form.email,
          purpose: 'SIGN_UP',
          verificationCode: parseInt(form.verificationCode, 10),
        },
      );

      const isVerified =
        response.data.emailVerified || response.data.verifySuccess;
      const token = response.data.token || response.data.verificationToken;

      if (isVerified) {
        Alert.alert('성공', '이메일 인증이 완료되었습니다.');
        setEmailAuthToken(token);
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

    if (!emailAuthToken) {
      Alert.alert('오류', '이메일 인증 토큰이 없습니다. 다시 인증해주세요.');
      return;
    }

    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      Alert.alert('오류', '올바른 나이를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const genderInt = form.gender === 'male' ? 0 : 1;

      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          nickname: form.nickname,
          password: form.password,
          gender: genderInt,
          age: ageNum,
        },
        {
          headers: {
            Authorization: `Bearer ${emailAuthToken}`,
          },
        },
      );

      // 회원가입 성공 → 자동 로그인 후 테마 선택
      try {
        setNeedsThemeSelection(true);
        await login(form.email, form.password);
        // login 성공 시 AppNavigator가 AppStack으로 전환 + ThemeSelector 표시
      } catch (loginError) {
        setNeedsThemeSelection(false);
        // 자동 로그인 실패 시 로그인 화면으로
        Alert.alert(
          '환영합니다!',
          '회원가입이 완료되었습니다. 로그인 해주세요.',
          [{ text: '확인', onPress: () => navigation.navigate('Login') }],
        );
      }
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

  const isPasswordMatch = useMemo(() => {
    return (
      form.confirmPassword.length > 0 && form.password === form.confirmPassword
    );
  }, [form.password, form.confirmPassword]);

  const isPasswordStepValid = useMemo(() => {
    return (
      passwordRequirements.hasMinLength &&
      passwordRequirements.hasCombination &&
      isPasswordMatch
    );
  }, [passwordRequirements, isPasswordMatch]);

  const isNextButtonEnabled = useMemo(() => {
    if (step === 1) return isEmailVerified;
    if (step === 2) return isPasswordStepValid;
    if (step === 3) return isNicknameVerified;
    return true;
  }, [step, isEmailVerified, isPasswordStepValid, isNicknameVerified]);

  const handleSelectAge = (selectedAge: string) => {
    handleChange('age', selectedAge);
    setAgeModalVisible(false);
  };

  return (
    <SignupScreenView
      step={step}
      totalSteps={totalSteps}
      form={form}
      isPasswordVisible={isPasswordVisible}
      isConfirmPasswordVisible={isConfirmPasswordVisible}
      isLoading={isLoading}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isNicknameVerified={isNicknameVerified}
      isEmailDuplicate={isEmailDuplicate}
      isAgeModalVisible={isAgeModalVisible}
      focusedField={focusedField}
      timeLeft={timeLeft}
      passwordRequirements={passwordRequirements}
      isPasswordMatch={isPasswordMatch}
      isNextButtonEnabled={isNextButtonEnabled}
      onChange={handleChange}
      onSendEmail={handleSendEmail}
      onVerifyCode={handleVerifyCode}
      onCheckNickname={handleCheckNickname}
      onSignup={handleSignup}
      onNextStep={handleNextStep}
      onPrevStep={handlePrevStep}
      onResetEmail={handleResetEmail}
      onSelectAge={handleSelectAge}
      setAgeModalVisible={setAgeModalVisible}
      setFocusedField={setFocusedField}
      setIsPasswordVisible={setIsPasswordVisible}
      setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
      formatTime={formatTime}
    />
  );
}
