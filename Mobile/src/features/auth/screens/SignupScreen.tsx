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
import { deadlineFromNow, secondsUntil } from '../../../utils/countdown';
import { useSubmitLock } from '../../../hooks/useSubmitLock';

const DUPLICATE_EMAIL_CODE = 'AUTH_004';
const NICKNAME_TAKEN_CODE = 'AUTH_005';

const GENDER_ENUM: Record<string, string> = { male: 'MALE', female: 'FEMALE' };

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

const CODE_TTL_SECONDS = 300;

const RESEND_COOLDOWN_SECONDS = 30;

const ADVANCE_DELAY_MS = 700;

const NICKNAME_DEBOUNCE_MS = 500;

export type NicknameStatus = 'idle' | 'checking' | 'available' | 'taken';

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

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

    birthdate: '',
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [focusSeq, setFocusSeq] = useState(0);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailAuthToken, setEmailAuthToken] = useState<string | null>(null);

  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeDeadlineRef = useRef<number | null>(null);
  const resendDeadlineRef = useRef<number | null>(null);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicknameSeqRef = useRef(0);
  const verificationSeqRef = useRef(0);

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

  useFocusEffect(
    useCallback(() => {
      setAdjustNothing();
      return () => setAdjustResize();
    }, []),
  );

  useEffect(() => {
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      setIsTimerActive(false);
      setIsCodeExpired(true);
      return;
    }
    const id = setTimeout(() => {
      const deadline = codeDeadlineRef.current;
      setTimeLeft(deadline === null ? 0 : secondsUntil(deadline));
    }, 1000);
    return () => clearTimeout(id);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => {
      const deadline = resendDeadlineRef.current;
      setResendCooldown(deadline === null ? 0 : secondsUntil(deadline));
    }, 1000);
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

  const isEmailFormatValid = EMAIL_REGEX.test(form.email.trim());

  const { runExclusive: runSendEmailExclusive } = useSubmitLock();

  const handleSendEmail = useCallback(
    () =>
      runSendEmailExclusive(async () => {
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
          codeDeadlineRef.current = deadlineFromNow(CODE_TTL_SECONDS);
          setTimeLeft(CODE_TTL_SECONDS);
          setIsTimerActive(true);
          resendDeadlineRef.current = deadlineFromNow(RESEND_COOLDOWN_SECONDS);
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
          setFocusSeq(seq => seq + 1);
        } catch (error) {
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
      }),
    [
      form.email,
      setFieldError,
      clearError,
      runSendEmailExclusive,
    ],
  );

  const handleVerifyCode = useCallback(async () => {
    const code = form.verificationCode;
    if (code.length !== 6 || isVerifying || isEmailVerified) return;

    const verificationSeq = ++verificationSeqRef.current;
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

      if (verificationSeq !== verificationSeqRef.current) return;

      const token = response.data.verificationToken;
      if (!token) {
        setForm(prev => ({ ...prev, verificationCode: '' }));
        setFieldError('verificationCode', '인증번호가 올바르지 않아요.');
        return;
      }

      setEmailAuthToken(token);
      setIsEmailVerified(true);
      setIsTimerActive(false);

      advanceTimerRef.current = setTimeout(() => {
        setStep(2);
        setFocusSeq(seq => seq + 1);
      }, ADVANCE_DELAY_MS);
    } catch (error) {
      if (verificationSeq !== verificationSeqRef.current) return;
      setForm(prev => ({ ...prev, verificationCode: '' }));
      setFieldError(
        'verificationCode',
        getDisplayErrorMessage(error, '인증번호가 올바르지 않아요.'),
      );
    } finally {
      if (verificationSeq === verificationSeqRef.current) {
        setIsVerifying(false);
      }
    }
  }, [
    form.verificationCode,
    form.email,
    isVerifying,
    isEmailVerified,
    clearError,
    setFieldError,
  ]);

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

  const handleEditEmail = useCallback(() => {
    verificationSeqRef.current += 1;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setShowVerificationInput(false);
    setIsEmailVerified(false);
    setIsVerifying(false);
    setEmailAuthToken(null);
    setIsTimerActive(false);
    setIsCodeExpired(false);
    codeDeadlineRef.current = null;
    setTimeLeft(CODE_TTL_SECONDS);
    resendDeadlineRef.current = null;
    setResendCooldown(0);
    setForm(prev => ({ ...prev, verificationCode: '' }));
    setErrors({});
    setFocusSeq(seq => seq + 1);
  }, []);

  useEffect(() => {
    const nicknameSeq = ++nicknameSeqRef.current;
    if (step !== 3) return;
    const nickname = form.nickname.trim();
    if (!nickname) {
      setNicknameStatus('idle');
      return;
    }

    const lengthError = getNicknameLengthError(nickname);
    if (lengthError) {
      setNicknameStatus('idle');
      setErrors(prev => ({ ...prev, nickname: lengthError }));
      return;
    }

    setNicknameStatus('checking');

    const id = setTimeout(async () => {
      try {
        const available = await verifyNicknameAvailable(nickname);

        if (nicknameSeq !== nicknameSeqRef.current) return;
        setNicknameStatus(available ? 'available' : 'taken');
      } catch (error) {
        if (nicknameSeq !== nicknameSeqRef.current) return;
        setNicknameStatus('idle');
        setErrors(prev => ({
          ...prev,
          nickname: '닉네임을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',
        }));
      }
    }, NICKNAME_DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [form.nickname, step]);

  const { isSubmitting, runExclusive: runSignupExclusive } = useSubmitLock();

  const handleSignup = useCallback(async () => {
    if (!emailAuthToken) {
      showAlert({
        title: '오류',
        message: '이메일 인증 정보가 만료됐어요. 처음부터 다시 진행해 주세요.',
      });
      return;
    }
    if (!form.birthdate) {
      setFieldError('birthdate', '생년월일을 선택해 주세요.');
      return;
    }

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

    await runSignupExclusive(async () => {
      try {
        await axios.post('/api/auth/register', {
          signupToken: emailAuthToken,
          nickname: form.nickname.trim(),
          password: form.password,
          gender: genderEnum,
          birthdate: form.birthdate,
        });

        try {
          setNeedsThemeSelection(true);
          await login(form.email.trim(), form.password);

        } catch (loginError) {
          setNeedsThemeSelection(false);
          showAlert({
            title: '환영해요!',
            message: '회원가입을 마쳤어요. 로그인해 주세요.',
            type: 'success',
            buttons: [
              // 가입이 끝난 폼으로 뒤로가기가 되면 안 되므로 스택에서 치운다.
              { text: '확인', onPress: () => navigation.replace('Login') },
            ],
          });
        }
      } catch (error) {
        const { code } = parseBackendError(error);
        if (code === NICKNAME_TAKEN_CODE) {
          setNicknameStatus('taken');
          setFieldError('nickname', '이미 사용 중인 닉네임이에요.');
          return;
        }
        setErrors({
          form: getDisplayErrorMessage(
            error,
            '회원가입에 실패했어요. 다시 시도해 주세요.',
          ),
        });
      }
    });
  }, [
    emailAuthToken,
    form,
    isAgreed,
    login,
    navigation,
    runSignupExclusive,
    setNeedsThemeSelection,
    showAlert,
    setFieldError,
  ]);

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

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      if (!isEmailVerified) {
        setFieldError('email', '이메일 인증을 완료해 주세요.');
        return;
      }
    }
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
    isEmailVerified,
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
