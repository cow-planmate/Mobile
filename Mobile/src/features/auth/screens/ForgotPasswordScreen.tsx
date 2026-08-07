import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
  ForgotPasswordScreenView,
  ForgotPasswordErrors,
  TempPasswordStatus,
} from './ForgotPasswordScreen.view';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

/** 인증번호 유효 시간 */
const CODE_TTL_SECONDS = 300;
/** 재전송을 다시 누를 수 있게 되기까지 */
const RESEND_COOLDOWN_SECONDS = 30;
/** 인증 성공 표시를 잠깐 보여준 뒤 임시 비밀번호 발송을 시작하기까지 */
const ADVANCE_DELAY_MS = 700;

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * 비밀번호 찾기.
 *
 * 서버가 지원하는 건 '이메일로 임시 비밀번호 발송'뿐이라, 인증이 끝나면 사람이
 * 한 번 더 누르게 하지 않고 그 자리에서 바로 발송을 시작한다. 2단계는 더 이상
 * 입력을 받는 화면이 아니라 그 결과(발송 중 · 완료 · 실패)를 보여주는 화면이다.
 */
export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [focusSeq, setFocusSeq] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [tempPasswordStatus, setTempPasswordStatus] =
    useState<TempPasswordStatus>('idle');

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFieldError = useCallback(
    (field: keyof ForgotPasswordErrors, message: string) => {
      setErrors(prev => ({ ...prev, [field]: message }));
      setFocusSeq(seq => seq + 1);
    },
    [],
  );

  const clearError = useCallback((field: keyof ForgotPasswordErrors) => {
    setErrors(prev => {
      if (!prev[field] && !prev.form) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  }, []);

  /* 시스템 뒤로가기. 결과 화면에서는 이메일 입력으로 되돌아간다. */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) {
        setStep(1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step]);

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

  const isEmailFormatValid = EMAIL_REGEX.test(email.trim());

  const handleSendVerificationEmail = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('email', '이메일을 입력해 주세요.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError('email', '이메일 형식을 확인해 주세요.');
      return;
    }

    setIsSendingEmail(true);
    clearError('email');

    try {
      await axios.post('/api/auth/email/verification', {
        email: trimmed,
        purpose: 'RESET_PASSWORD',
      });

      setShowVerificationInput(true);
      setVerificationCode('');
      setIsCodeExpired(false);
      setTimeLeft(CODE_TTL_SECONDS);
      setIsTimerActive(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setFocusSeq(seq => seq + 1);
    } catch (error) {
      setFieldError(
        'email',
        getDisplayErrorMessage(
          error,
          '인증번호를 보내지 못했어요. 이메일 주소를 다시 확인해 주세요.',
        ),
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [email, setFieldError, clearError]);

  /** 인증이 끝나면 사용자가 한 번 더 누르지 않고 바로 임시 비밀번호를 보낸다. */
  const sendTempPassword = useCallback(async (token: string) => {
    setTempPasswordStatus('sending');
    try {
      await axios.post('/api/auth/password/email', {
        verificationToken: token,
      });
      setTempPasswordStatus('sent');
    } catch (error: any) {
      const status = error?.response?.status;
      setTempPasswordStatus('failed');
      setErrors({
        form:
          status === 403
            ? '임시 비밀번호 발급 권한이 없어요. 잠시 후 다시 시도해 주세요.'
            : getDisplayErrorMessage(
                error,
                '임시 비밀번호 발송에 실패했어요. 다시 시도해 주세요.',
              ),
      });
    }
  }, []);

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6 || isVerifying || isEmailVerified) {
      return;
    }

    setIsVerifying(true);
    clearError('verificationCode');

    try {
      const response = await axios.post(
        '/api/auth/email/verification/confirm',
        {
          email: email.trim(),
          purpose: 'RESET_PASSWORD',
          verificationCode: parseInt(verificationCode, 10),
        },
      );

      const token = response.data.verificationToken || response.data.token;
      if (!token) {
        setVerificationCode('');
        setFieldError('verificationCode', '인증번호가 올바르지 않아요.');
        return;
      }

      setIsEmailVerified(true);
      setIsTimerActive(false);

      // 성공 표시를 잠깐 보여준 뒤 결과 화면으로 넘어가 발송을 시작한다.
      advanceTimerRef.current = setTimeout(() => {
        setStep(2);
        void sendTempPassword(token);
      }, ADVANCE_DELAY_MS);
    } catch (error) {
      setVerificationCode('');
      setFieldError(
        'verificationCode',
        getDisplayErrorMessage(error, '인증번호가 올바르지 않아요.'),
      );
    } finally {
      setIsVerifying(false);
    }
  }, [
    verificationCode,
    email,
    isVerifying,
    isEmailVerified,
    clearError,
    setFieldError,
    sendTempPassword,
  ]);

  /** 여섯 자리가 채워지면 바로 확인한다. */
  useEffect(() => {
    if (step !== 1) return;
    if (!showVerificationInput || isEmailVerified || isCodeExpired) return;
    if (verificationCode.length !== 6) return;
    void handleVerifyCode();
  }, [
    step,
    showVerificationInput,
    isEmailVerified,
    isCodeExpired,
    verificationCode,
    handleVerifyCode,
  ]);

  /** 이메일을 고치러 돌아간다. 인증 상태를 전부 되돌린다. */
  const handleEditEmail = useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setShowVerificationInput(false);
    setIsEmailVerified(false);
    setIsTimerActive(false);
    setIsCodeExpired(false);
    setTimeLeft(CODE_TTL_SECONDS);
    setResendCooldown(0);
    setVerificationCode('');
    setErrors({});
    setFocusSeq(seq => seq + 1);
  }, []);

  const handleRetryTempPassword = useCallback(() => {
    // 토큰은 검증 시점에만 잠깐 들고 있었으므로, 실패 시 재시도는 처음부터
    // 다시 인증하게 한다. 토큰을 오래 들고 있으면 그사이 만료될 수 있다.
    setErrors({});
    handleEditEmail();
    setStep(1);
  }, [handleEditEmail]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      setStep(1);
      setErrors({});
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const handleGoToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <ForgotPasswordScreenView
      step={step}
      totalSteps={totalSteps}
      email={email}
      verificationCode={verificationCode}
      errors={errors}
      focusSeq={focusSeq}
      isSendingEmail={isSendingEmail}
      isVerifying={isVerifying}
      isEmailFormatValid={isEmailFormatValid}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isCodeExpired={isCodeExpired}
      resendCooldown={resendCooldown}
      focusedField={focusedField}
      timeLeft={timeLeft}
      tempPasswordStatus={tempPasswordStatus}
      onEmailChange={text => {
        setEmail(text);
        clearError('email');
      }}
      onVerificationCodeChange={text => {
        setVerificationCode(text.replace(/[^0-9]/g, ''));
        clearError('verificationCode');
      }}
      onSendVerificationEmail={handleSendVerificationEmail}
      onEditEmail={handleEditEmail}
      onRetryTempPassword={handleRetryTempPassword}
      onGoToLogin={handleGoToLogin}
      onPrevStep={handlePrevStep}
      setFocusedField={setFocusedField}
      formatTime={formatTime}
    />
  );
}
