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
import { deadlineFromNow, secondsUntil } from '../../../utils/countdown';
import { useSubmitLock } from '../../../hooks/useSubmitLock';

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

const CODE_TTL_SECONDS = 300;

const RESEND_COOLDOWN_SECONDS = 30;

const ADVANCE_DELAY_MS = 700;

const FALLBACK_TEMP_PASSWORD_ERROR =
  '임시 비밀번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.';

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

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
  const codeDeadlineRef = useRef<number | null>(null);
  const resendDeadlineRef = useRef<number | null>(null);
  const tempPasswordSeqRef = useRef(0);

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

  const isEmailFormatValid = EMAIL_REGEX.test(email.trim());

  const { runExclusive: runSendEmailExclusive } = useSubmitLock();

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

    await runSendEmailExclusive(async () => {
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
        codeDeadlineRef.current = deadlineFromNow(CODE_TTL_SECONDS);
        setTimeLeft(CODE_TTL_SECONDS);
        setIsTimerActive(true);
        resendDeadlineRef.current = deadlineFromNow(RESEND_COOLDOWN_SECONDS);
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
    });
  }, [email, setFieldError, clearError, runSendEmailExclusive]);

  const sendTempPassword = useCallback(async (token: string) => {
    const seq = ++tempPasswordSeqRef.current;
    setTempPasswordStatus('sending');
    try {
      await axios.post('/api/auth/password/email', {
        verificationToken: token,
      });
      if (seq !== tempPasswordSeqRef.current) return;
      setTempPasswordStatus('sent');
    } catch (error: any) {
      if (seq !== tempPasswordSeqRef.current) return;
      const status = error?.response?.status;
      setTempPasswordStatus('failed');
      setErrors({
        form:

          status === 404 || status === 403
            ? FALLBACK_TEMP_PASSWORD_ERROR
            : getDisplayErrorMessage(error, FALLBACK_TEMP_PASSWORD_ERROR),
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

      const token = response.data.verificationToken;
      if (!token) {
        setVerificationCode('');
        setFieldError('verificationCode', '인증번호가 올바르지 않아요.');
        return;
      }

      setIsEmailVerified(true);
      setIsTimerActive(false);

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

  const handleEditEmail = useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setShowVerificationInput(false);
    setIsEmailVerified(false);
    setIsTimerActive(false);
    setIsCodeExpired(false);
    codeDeadlineRef.current = null;
    setTimeLeft(CODE_TTL_SECONDS);
    resendDeadlineRef.current = null;
    setResendCooldown(0);
    setVerificationCode('');
    setErrors({});
    setFocusSeq(seq => seq + 1);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) {
        handleEditEmail();
        setStep(1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, handleEditEmail]);

  const handleRetryTempPassword = useCallback(() => {

    setErrors({});
    handleEditEmail();
    setStep(1);
  }, [handleEditEmail]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      handleEditEmail();
      setStep(1);
    } else {
      navigation.goBack();
    }
  }, [step, navigation, handleEditEmail]);

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
