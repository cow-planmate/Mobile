import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { SignupScreenView, SignupErrors } from './SignupScreen.view';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import {
  parseBackendError,
  getDisplayErrorMessage,
} from '../../../utils/errorHandler';
import { toBirthdateString } from '../../../utils/birthdate';
import { getNicknameLengthError } from '../../../utils/nickname';
import { getPasswordRequirements } from '../../../utils/passwordPolicy';
import { verifyNicknameAvailable } from '../../../api/auth';
import { setAdjustNothing, setAdjustResize } from '../../../utils/softInputMode';

/** 이미 가입된 이메일일 때 서버가 주는 코드 (AUTH_004) */
const DUPLICATE_EMAIL_CODE = 'AUTH_004';

/** 화면 선택값 → 서버 Gender enum. 서버에는 OTHER도 있으나 화면은 둘만 받는다. */
const GENDER_ENUM: Record<string, string> = { male: 'MALE', female: 'FEMALE' };

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

/** 인증번호 유효 시간 */
const CODE_TTL_SECONDS = 300;
/** 재전송을 다시 누를 수 있게 되기까지 */
const RESEND_COOLDOWN_SECONDS = 30;
/** 인증 성공 표시를 잠깐 보여준 뒤 다음 단계로 넘어가기까지 */
const ADVANCE_DELAY_MS = 700;
/** 닉네임 입력이 멈춘 뒤 중복 검사를 보내기까지 */
const NICKNAME_DEBOUNCE_MS = 500;

export type NicknameStatus = 'idle' | 'checking' | 'available' | 'taken';

/**
 * 타이머 남은 시간을 'M:SS' 포맷으로 변환하는 헬퍼 함수
 */
const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * 이메일 인증, 비밀번호 입력, 닉네임 검증 및 회원가입 단계별 폼 컨테이너 컴포넌트
 */
export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore(state => state.login);
  const setNeedsThemeSelection = useAuthStore(
    state => state.setNeedsThemeSelection,
  );
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    gender: '',
    /** 'YYYY-MM-DD'. 나이를 받아 역산하면 실제 월·일이 사라진다. */
    birthdate: '',
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [focusSeq, setFocusSeq] = useState(0);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /** 개별 동작마다 따로 둔다. 인증 확인 중에 재전송이 함께 잠기면 안 된다. */
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailAuthToken, setEmailAuthToken] = useState<string | null>(null);

  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicknameSeqRef = useRef(0);

  const setFieldError = useCallback((field: keyof SignupErrors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setFocusSeq(seq => seq + 1);
  }, []);

  const clearError = useCallback((field: keyof SignupErrors) => {
    setErrors(prev => {
      if (!prev[field] && !prev.form) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  }, []);

  /* ────────────────────────────────────────────────
   * 시스템 뒤로가기
   *
   * 단계는 컴포넌트 안의 state라 네비게이션 스택에는 이 화면 하나뿐이다.
   * 처리하지 않으면 갤럭시에서 가장자리를 스와이프했을 때 이메일 인증부터
   * 닉네임까지 입력한 것이 전부 사라진 채 화면을 벗어난다.
   * ──────────────────────────────────────────────── */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) {
        setStep(prev => prev - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step]);

  /**
   * 이 화면에 있는 동안만 키보드가 떠도 레이아웃이 움직이지 않게 한다.
   * 벗어나면 다른 화면(채팅 등)이 쓰는 기본 리사이즈 동작으로 되돌린다.
   */
  useFocusEffect(
    useCallback(() => {
      setAdjustNothing();
      return () => setAdjustResize();
    }, []),
  );

  /* 인증번호 타이머. 0이 되면 만료로 두고 다시 300으로 되돌리지 않는다. */
  useEffect(() => {
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      setIsTimerActive(false);
      setIsCodeExpired(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isTimerActive, timeLeft]);

  /* 재전송 쿨다운 */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const handleChange = useCallback(
    (name: string, value: string) => {
      setForm(prev => ({ ...prev, [name]: value }));
      clearError(name as keyof SignupErrors);
      if (name === 'nickname') setNicknameStatus('idle');
    },
    [clearError],
  );

  /* ── 1단계: 이메일 인증 ── */

  const isEmailFormatValid = EMAIL_REGEX.test(form.email.trim());

  const handleSendEmail = useCallback(async () => {
    const email = form.email.trim();
    if (!email) {
      setFieldError('email', '이메일을 입력해 주세요.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setFieldError('email', '이메일 형식을 확인해 주세요.');
      return;
    }

    setIsSendingEmail(true);
    clearError('email');

    try {
      await axios.post('/api/auth/email/verification', {
        email,
        purpose: 'SIGN_UP',
      });

      setShowVerificationInput(true);
      setForm(prev => ({ ...prev, verificationCode: '' }));
      setIsCodeExpired(false);
      setTimeLeft(CODE_TTL_SECONDS);
      setIsTimerActive(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setFocusSeq(seq => seq + 1);
    } catch (error) {
      // 문구가 아니라 에러 코드로 판단한다.
      const { code } = parseBackendError(error);
      setFieldError(
        'email',
        code === DUPLICATE_EMAIL_CODE
          ? '이미 가입된 이메일이에요.'
          : getDisplayErrorMessage(
              error,
              '인증번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
            ),
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [form.email, setFieldError, clearError]);

  const handleVerifyCode = useCallback(async () => {
    const code = form.verificationCode;
    if (code.length !== 6 || isVerifying || isEmailVerified) return;

    setIsVerifying(true);
    clearError('verificationCode');

    try {
      const response = await axios.post(
        '/api/auth/email/verification/confirm',
        {
          email: form.email.trim(),
          purpose: 'SIGN_UP',
          verificationCode: parseInt(code, 10),
        },
      );

      const token = response.data.verificationToken || response.data.token;
      if (!token) {
        setForm(prev => ({ ...prev, verificationCode: '' }));
        setFieldError('verificationCode', '인증번호가 올바르지 않아요.');
        return;
      }

      setEmailAuthToken(token);
      setIsEmailVerified(true);
      setIsTimerActive(false);

      // 성공 표시를 잠깐 보여준 뒤 다음 단계로 넘어간다.
      advanceTimerRef.current = setTimeout(() => {
        setStep(2);
        setFocusSeq(seq => seq + 1);
      }, ADVANCE_DELAY_MS);
    } catch (error) {
      setForm(prev => ({ ...prev, verificationCode: '' }));
      setFieldError(
        'verificationCode',
        getDisplayErrorMessage(error, '인증번호가 올바르지 않아요.'),
      );
    } finally {
      setIsVerifying(false);
    }
  }, [
    form.verificationCode,
    form.email,
    isVerifying,
    isEmailVerified,
    clearError,
    setFieldError,
  ]);

  /**
   * 여섯 자리가 채워지면 바로 확인한다.
   * 예전에는 입력을 마친 뒤 '인증번호 확인'을 눌러야 했고, 그 버튼이 다시
   * '다음'으로 바뀌어 한 단계를 넘는 데 세 번을 눌러야 했다.
   */
  useEffect(() => {
    if (step !== 1) return;
    if (!showVerificationInput || isEmailVerified || isCodeExpired) return;
    if (form.verificationCode.length !== 6) return;
    void handleVerifyCode();
  }, [
    step,
    showVerificationInput,
    isEmailVerified,
    isCodeExpired,
    form.verificationCode,
    handleVerifyCode,
  ]);

  /** 이메일을 고치러 돌아간다. 인증 상태를 전부 되돌린다. */
  const handleEditEmail = useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setShowVerificationInput(false);
    setIsEmailVerified(false);
    setEmailAuthToken(null);
    setIsTimerActive(false);
    setIsCodeExpired(false);
    setTimeLeft(CODE_TTL_SECONDS);
    setResendCooldown(0);
    setForm(prev => ({ ...prev, verificationCode: '' }));
    setErrors({});
    setFocusSeq(seq => seq + 1);
  }, []);

  /* ── 3단계: 닉네임 & 내 정보 ── */

  /**
   * 입력이 멈추면 중복 검사를 보낸다.
   * '중복확인' 버튼을 눌러야 '다음'이 나타나던 구조라, 닉네임을 한 글자만
   * 고쳐도 처음부터 다시 눌러야 했다.
   */
  useEffect(() => {
    if (step !== 3) return;
    const nickname = form.nickname.trim();
    if (!nickname) {
      setNicknameStatus('idle');
      return;
    }

    // 서버 중복 확인은 길이를 보지 않는다. 2자 미만을 그대로 보내면 '사용 가능'을
    // 받은 뒤 가입 요청에서야 400이 난다.
    const lengthError = getNicknameLengthError(nickname);
    if (lengthError) {
      setNicknameStatus('idle');
      setErrors(prev => ({ ...prev, nickname: lengthError }));
      return;
    }

    setNicknameStatus('checking');
    const seq = ++nicknameSeqRef.current;

    const id = setTimeout(async () => {
      try {
        const available = await verifyNicknameAvailable(nickname);
        // 빠르게 입력하면 이전 요청이 나중에 도착할 수 있다.
        if (seq !== nicknameSeqRef.current) return;
        setNicknameStatus(available ? 'available' : 'taken');
      } catch (error) {
        if (seq !== nicknameSeqRef.current) return;
        setNicknameStatus('idle');
        setErrors(prev => ({
          ...prev,
          nickname: '닉네임을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',
        }));
      }
    }, NICKNAME_DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [form.nickname, step]);

  /* ── 가입 완료 제출 ── */

  const handleSignup = useCallback(async () => {
    if (!emailAuthToken) {
      showAlert({
        title: '오류',
        message: '이메일 인증 정보가 만료되었습니다. 처음부터 다시 진행해주세요.',
      });
      return;
    }
    if (!form.birthdate) {
      setFieldError('birthdate', '생년월일을 선택해 주세요.');
      return;
    }
    // 서버 birthdate는 @Past다. 오늘 이후 날짜는 여기서 걸러 낸다.
    if (form.birthdate >= toBirthdateString(new Date())) {
      setFieldError('birthdate', '생년월일을 다시 확인해 주세요.');
      return;
    }
    const genderEnum = GENDER_ENUM[form.gender];
    if (!genderEnum) {
      setFieldError('gender', '성별을 선택해 주세요.');
      return;
    }
    if (!isAgreed) {
      setFieldError('agreement', '개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/auth/register', {
        signupToken: emailAuthToken,
        nickname: form.nickname.trim(),
        password: form.password,
        gender: genderEnum,
        birthdate: form.birthdate,
      });

      // 회원가입 성공 → 자동 로그인 후 테마 선택
      try {
        setNeedsThemeSelection(true);
        await login(form.email.trim(), form.password);
        // login 성공 시 AppNavigator가 AppStack으로 전환 + ThemeSelector 표시
      } catch (loginError) {
        setNeedsThemeSelection(false);
        showAlert({
          title: '환영합니다!',
          message: '회원가입이 완료되었습니다. 로그인 해주세요.',
          type: 'success',
          buttons: [
            { text: '확인', onPress: () => navigation.navigate('Login') },
          ],
        });
      }
    } catch (error) {
      setErrors({
        form: getDisplayErrorMessage(
          error,
          '회원가입에 실패했어요. 다시 시도해 주세요.',
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    emailAuthToken,
    form,
    isAgreed,
    login,
    navigation,
    setNeedsThemeSelection,
    showAlert,
    setFieldError,
  ]);

  /* ── 단계 이동 ── */

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(form.password),
    [form.password],
  );

  const isPasswordMatch = useMemo(
    () =>
      form.confirmPassword.length > 0 &&
      form.password === form.confirmPassword,
    [form.password, form.confirmPassword],
  );

  const isNextEnabled = useMemo(() => {
    if (step === 1) return isEmailVerified;
    if (step === 2)
      return (
        passwordRequirements.hasMinLength &&
        passwordRequirements.hasCombination &&
        isPasswordMatch
      );
    return (
      nicknameStatus === 'available' &&
      !!form.birthdate &&
      !!form.gender &&
      isAgreed
    );
  }, [
    step,
    isEmailVerified,
    passwordRequirements,
    isPasswordMatch,
    nicknameStatus,
    form.birthdate,
    form.gender,
    isAgreed,
  ]);

  /** 다음으로 못 넘어갈 때 이유를 필드에 붙인다. 버튼을 회색으로 죽이지 않는다. */
  const handleNextStep = useCallback(() => {
    if (step === 2) {
      if (!passwordRequirements.hasMinLength || !passwordRequirements.hasCombination) {
        setFieldError('password', '비밀번호 조건을 모두 채워 주세요.');
        return;
      }
      if (!isPasswordMatch) {
        setFieldError('confirmPassword', '비밀번호가 서로 달라요.');
        return;
      }
    }
    if (step === totalSteps) {
      const nicknameError = getNicknameLengthError(form.nickname);
      if (nicknameError) {
        setFieldError('nickname', nicknameError);
        return;
      }
      if (nicknameStatus === 'taken') {
        setFieldError('nickname', '이미 사용 중인 닉네임이에요.');
        return;
      }
      if (nicknameStatus !== 'available') return;
      void handleSignup();
      return;
    }
    setStep(prev => prev + 1);
    setErrors({});
    setFocusSeq(seq => seq + 1);
  }, [
    step,
    totalSteps,
    passwordRequirements,
    isPasswordMatch,
    form.nickname,
    nicknameStatus,
    handleSignup,
    setFieldError,
  ]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setErrors({});
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  return (
    <SignupScreenView
      step={step}
      totalSteps={totalSteps}
      form={form}
      errors={errors}
      focusSeq={focusSeq}
      isPasswordVisible={isPasswordVisible}
      isConfirmPasswordVisible={isConfirmPasswordVisible}
      isSendingEmail={isSendingEmail}
      isVerifying={isVerifying}
      isSubmitting={isSubmitting}
      isEmailFormatValid={isEmailFormatValid}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isCodeExpired={isCodeExpired}
      resendCooldown={resendCooldown}
      nicknameStatus={nicknameStatus}
      focusedField={focusedField}
      timeLeft={timeLeft}
      passwordRequirements={passwordRequirements}
      isPasswordMatch={isPasswordMatch}
      isNextEnabled={isNextEnabled}
      isAgreed={isAgreed}
      onChangeAgreement={setIsAgreed}
      onChange={handleChange}
      onSendEmail={handleSendEmail}
      onEditEmail={handleEditEmail}
      onNextStep={handleNextStep}
      onPrevStep={handlePrevStep}
      setFocusedField={setFocusedField}
      setIsPasswordVisible={setIsPasswordVisible}
      setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
      formatTime={formatTime}
    />
  );
}
