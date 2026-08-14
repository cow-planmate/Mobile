import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOut,
  FadeInRight,
  FadeInLeft,
} from 'react-native-reanimated';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
import Check from 'lucide-react-native/dist/esm/icons/check';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import XCircle from 'lucide-react-native/dist/esm/icons/circle-x';
import Loader from 'lucide-react-native/dist/esm/icons/loader';
import { styles } from './ForgotPasswordScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../design/scale';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';

/* ── 인라인 오류 ── */

const InlineError = ({ message }: { message: string }) => (
  <Animated.View
    style={styles.errorRow}
    entering={FadeInDown.duration(180)}
    exiting={FadeOut.duration(120)}
    accessibilityLiveRegion="polite"
  >
    <AlertCircle size={sf(15)} color={COLORS.error} style={styles.errorIcon} />
    <Text style={styles.errorText}>{message}</Text>
  </Animated.View>
);

/* ── Props ── */

export interface ForgotPasswordErrors {
  email?: string;
  verificationCode?: string;
  form?: string;
}

export type TempPasswordStatus = 'idle' | 'sending' | 'sent' | 'failed';

export interface ForgotPasswordScreenViewProps {
  step: number;
  totalSteps: number;
  email: string;
  verificationCode: string;
  errors: ForgotPasswordErrors;
  focusSeq: number;
  isSendingEmail: boolean;
  isVerifying: boolean;
  isEmailFormatValid: boolean;
  showVerificationInput: boolean;
  isEmailVerified: boolean;
  isCodeExpired: boolean;
  resendCooldown: number;
  focusedField: string | null;
  timeLeft: number;
  tempPasswordStatus: TempPasswordStatus;
  onEmailChange: (email: string) => void;
  onVerificationCodeChange: (code: string) => void;
  onSendVerificationEmail: () => void;
  onEditEmail: () => void;
  onRetryTempPassword: () => void;
  onGoToLogin: () => void;
  onPrevStep: () => void;
  setFocusedField: (field: string | null) => void;
  formatTime: (seconds: number) => string;
}

export const ForgotPasswordScreenView = ({
  step,
  totalSteps,
  email,
  verificationCode,
  errors,
  focusSeq,
  isSendingEmail,
  isVerifying,
  isEmailFormatValid,
  showVerificationInput,
  isEmailVerified,
  isCodeExpired,
  resendCooldown,
  focusedField,
  timeLeft,
  tempPasswordStatus,
  onEmailChange,
  onVerificationCodeChange,
  onSendVerificationEmail,
  onEditEmail,
  onRetryTempPassword,
  onGoToLogin,
  onPrevStep,
  setFocusedField,
  formatTime,
}: ForgotPasswordScreenViewProps) => {
  const insets = useSafeAreaInsets();

  const emailRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);

  const prevStepRef = useRef(step);
  const goingForward = step >= prevStepRef.current;
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (focusSeq === 0) return;
    const id = setTimeout(() => {
      if (errors.email) return emailRef.current?.focus();
      if (errors.verificationCode) return codeRef.current?.focus();
      if (step === 1) {
        return showVerificationInput && !isEmailVerified
          ? codeRef.current?.focus()
          : emailRef.current?.focus();
      }
    }, 120);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq]);

  const emailLocked = showVerificationInput || isEmailVerified;

  const emailState: FieldState = errors.email
    ? 'error'
    : focusedField === 'email'
    ? 'focus'
    : 'default';
  const codeState: FieldState = errors.verificationCode
    ? 'error'
    : isEmailVerified
    ? 'success'
    : focusedField === 'verificationCode'
    ? 'focus'
    : 'default';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerBackButton}
          onPress={onPrevStep}
          accessibilityRole="button"
          accessibilityLabel={step > 1 ? '이전 단계' : '뒤로 가기'}
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>

        <View style={styles.progressTrack}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < step && styles.progressSegmentOn,
              ]}
            />
          ))}
        </View>

        <Text style={styles.progressCount}>
          {step} / {totalSteps}
        </Text>
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[
          styles.scrollContainer,
          // step 1은 하단 버튼이 없어 스크롤 영역이 곧 화면 맨 아래다.
          step === 1 && { paddingBottom: insets.bottom + sf(32) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={(goingForward ? FadeInRight : FadeInLeft).duration(220)}
        >
          {step === 1 && (
            <>
              <Text style={styles.title}>비밀번호 찾기</Text>
              <Text style={styles.description}>
                가입하신 이메일 주소로 인증번호를 보내드려요.
              </Text>

              <View style={styles.inputGroup}>
                <View style={styles.fieldRow}>
                  <AuthFieldBox
                    state={emailState}
                    style={[
                      styles.authInputContainer,
                      emailLocked && styles.inputLocked,
                    ]}
                    containerStyle={styles.flex1}
                    label="이메일"
                    labelBackground={
                      emailLocked ? COLORS.surface : COLORS.surfaceRaised
                    }
                  >
                    {emailLocked ? (
                      <Text style={styles.authValue} numberOfLines={1}>
                        {email}
                      </Text>
                    ) : (
                      <TextInput
                        ref={emailRef}
                        style={styles.authInput}
                        placeholder="example@email.com"
                        placeholderTextColor={COLORS.textSecondary}
                        value={email}
                        onChangeText={onEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete="email"
                        importantForAutofill="yes"
                        returnKeyType="send"
                        onSubmitEditing={onSendVerificationEmail}
                        editable={!isSendingEmail}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="이메일"
                      />
                    )}
                  </AuthFieldBox>

                  {!emailLocked ? (
                    <PressableScale
                      style={[
                        styles.inlineButton,
                        (!isEmailFormatValid || isSendingEmail) &&
                          styles.inlineButtonDisabled,
                      ]}
                      baseColor={
                        !isEmailFormatValid || isSendingEmail
                          ? COLORS.border
                          : COLORS.primary
                      }
                      pressedColor={COLORS.primaryPressed}
                      scaleTo={0.95}
                      onPress={onSendVerificationEmail}
                      disabled={!isEmailFormatValid || isSendingEmail}
                      accessibilityRole="button"
                      accessibilityLabel="인증번호 요청"
                    >
                      <Text style={styles.inlineButtonText}>
                        {isSendingEmail ? '전송 중' : '인증요청'}
                      </Text>
                    </PressableScale>
                  ) : (
                    !isEmailVerified && (
                      <Pressable
                        style={styles.editButton}
                        onPress={onEditEmail}
                        accessibilityRole="button"
                        accessibilityLabel="이메일 수정"
                      >
                        <Text style={styles.editButtonText}>수정</Text>
                      </Pressable>
                    )
                  )}
                </View>
                {!!errors.email && <InlineError message={errors.email} />}
              </View>

              {showVerificationInput && (
                <Animated.View
                  style={styles.inputGroup}
                  entering={FadeInDown.duration(220)}
                >
                  <AuthFieldBox
                    state={codeState}
                    style={styles.authInputContainer}
                    label="인증번호"
                  >
                    <View style={styles.authInputRow}>
                      <TextInput
                        ref={codeRef}
                        style={styles.authInput}
                        placeholder="6자리 숫자"
                        placeholderTextColor={COLORS.textSecondary}
                        value={verificationCode}
                        onChangeText={onVerificationCodeChange}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoComplete="sms-otp"
                        importantForAutofill="yes"
                        editable={
                          !isEmailVerified && !isCodeExpired && !isVerifying
                        }
                        onFocus={() => setFocusedField('verificationCode')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="인증번호 6자리"
                      />
                      {isVerifying ? (
                        <Loader size={sf(18)} color={COLORS.textSecondary} />
                      ) : isEmailVerified ? (
                        <Check
                          size={sf(20)}
                          color={COLORS.success}
                          strokeWidth={3}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.timerText,
                            isCodeExpired && styles.timerTextExpired,
                          ]}
                        >
                          {formatTime(timeLeft)}
                        </Text>
                      )}
                    </View>
                  </AuthFieldBox>

                  {!!errors.verificationCode && (
                    <InlineError message={errors.verificationCode} />
                  )}

                  {isEmailVerified ? (
                    <Animated.View
                      style={styles.statusRow}
                      entering={FadeInDown.duration(160)}
                    >
                      <Check
                        size={sf(14)}
                        color={COLORS.success}
                        strokeWidth={3}
                      />
                      <Text style={styles.statusTextOk}>
                        인증이 완료되었어요.
                      </Text>
                    </Animated.View>
                  ) : (
                    <View style={styles.resendRow}>
                      <Text style={styles.resendHint}>
                        {isCodeExpired
                          ? '인증 시간이 지났어요.'
                          : '메일이 오지 않았나요?'}
                      </Text>
                      <Pressable
                        onPress={onSendVerificationEmail}
                        disabled={resendCooldown > 0 || isSendingEmail}
                        style={styles.resendButton}
                        accessibilityRole="button"
                        accessibilityLabel="인증번호 다시 받기"
                      >
                        <Text
                          style={[
                            styles.resendButtonText,
                            resendCooldown > 0 &&
                              styles.resendButtonTextDisabled,
                          ]}
                        >
                          {resendCooldown > 0
                            ? `다시 받기 (${resendCooldown}초)`
                            : '다시 받기'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </Animated.View>
              )}
            </>
          )}

          {step === 2 && (
            <View style={styles.resultContainer}>
              {tempPasswordStatus === 'sent' ? (
                <>
                  <View
                    style={[
                      styles.resultIconWrap,
                      styles.resultIconWrapSuccess,
                    ]}
                  >
                    <CheckCircle2 size={sf(36)} color={COLORS.success} />
                  </View>
                  <Text style={styles.resultTitle}>
                    임시 비밀번호를 보냈어요
                  </Text>
                  <Text style={styles.resultBody}>
                    {email}로 임시 비밀번호를 보냈어요.{'\n'}
                    메일함을 확인해 주세요.
                  </Text>
                  <View style={styles.resultNote}>
                    <Text style={styles.resultNoteText}>
                      로그인 후 마이페이지에서 꼭 비밀번호를 바꿔 주세요.
                    </Text>
                  </View>
                </>
              ) : tempPasswordStatus === 'failed' ? (
                <>
                  <View
                    style={[styles.resultIconWrap, styles.resultIconWrapError]}
                  >
                    <XCircle size={sf(36)} color={COLORS.error} />
                  </View>
                  <Text style={styles.resultTitle}>발송하지 못했어요</Text>
                  <Text style={styles.resultBody}>
                    {errors.form ?? '잠시 후 다시 시도해 주세요.'}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.resultIconWrap}>
                    <Loader size={sf(32)} color={COLORS.primary} />
                  </View>
                  <Text style={styles.resultTitle}>
                    임시 비밀번호를 보내고 있어요
                  </Text>
                  <Text style={styles.resultBody}>잠시만 기다려 주세요.</Text>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/*
        1단계는 하단에 별도 버튼을 두지 않는다. 이메일 옆 '인증요청'이 유일한
        능동 액션이고, 인증번호 여섯 자리를 채우면 자동으로 다음으로 넘어간다.
        누른다고 뭔가 더 진행되지 않는 버튼을 상시 띄워두는 대신, 진행할 수
        없을 때는 아예 보여주지 않는다.
      */}
      {step === 2 && (
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + sf(16) }]}
        >
          {tempPasswordStatus === 'sent' && (
            <AuthSubmitButton
              label="로그인하러 가기"
              onPress={onGoToLogin}
              accessibilityLabel="로그인 화면으로 이동"
            />
          )}

          {tempPasswordStatus === 'failed' && (
            <AuthSubmitButton
              label="다시 시도"
              onPress={onRetryTempPassword}
              accessibilityLabel="처음부터 다시 시도"
            />
          )}

          {tempPasswordStatus === 'sending' && (
            <AuthSubmitButton
              label="발송 중"
              onPress={() => {}}
              loading
              disabled
              accessibilityLabel="임시 비밀번호 발송 중"
            />
          )}
        </View>
      )}
    </View>
  );
};
