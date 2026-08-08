import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOut,
  FadeInRight,
  FadeInLeft,
} from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Circle,
  AlertCircle,
  Loader,
} from 'lucide-react-native';
import { styles } from './SignupScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../design/scale';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { revealStep, PUSH_TRANSITION_MS } from '../motion';
import {
  formatBirthdate,
  parseBirthdate,
  toBirthdateString,
} from '../../../utils/birthdate';
import type { NicknameStatus } from './SignupScreen';

/* ── 비밀번호 조건 한 줄 ── */

export const PasswordRequirement = React.memo(
  ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.requirementRow}>
      {/* 색만 바꾸면 색각 이상 사용자가 구분하지 못한다. 형태를 바꾼다. */}
      {met ? (
        <Check size={sf(15)} color={COLORS.success} strokeWidth={3} />
      ) : (
        <Circle size={sf(15)} color={COLORS.textDisabled} strokeWidth={2} />
      )}
      <Text
        style={[
          styles.requirementText,
          { color: met ? COLORS.success : COLORS.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  ),
);

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

export interface SignupErrors {
  email?: string;
  verificationCode?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  birthdate?: string;
  gender?: string;
  agreement?: string;
  form?: string;
}

export interface SignupScreenViewProps {
  step: number;
  totalSteps: number;
  form: any;
  errors: SignupErrors;
  focusSeq: number;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  isSendingEmail: boolean;
  isVerifying: boolean;
  isSubmitting: boolean;
  isEmailFormatValid: boolean;
  showVerificationInput: boolean;
  isEmailVerified: boolean;
  isCodeExpired: boolean;
  resendCooldown: number;
  nicknameStatus: NicknameStatus;
  focusedField: string | null;
  timeLeft: number;
  passwordRequirements: { hasMinLength: boolean; hasCombination: boolean };
  isPasswordMatch: boolean;
  isNextEnabled: boolean;
  isAgreed: boolean;
  onChangeAgreement: (agreed: boolean) => void;
  onChange: (name: string, value: string) => void;
  onSendEmail: () => void;
  onEditEmail: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  setFocusedField: (field: string | null) => void;
  setIsPasswordVisible: (visible: boolean | ((v: boolean) => boolean)) => void;
  setIsConfirmPasswordVisible: (
    visible: boolean | ((v: boolean) => boolean),
  ) => void;
  formatTime: (seconds: number) => string;
}

const STEP_TITLES = ['이메일 인증', '비밀번호 설정', '프로필 설정'];
const STEP_DESCRIPTIONS = [
  '로그인에 사용할 이메일을 인증해주세요.',
  '안전하게 보호할 비밀번호를 만들어 주세요.',
  '앱에서 사용할 닉네임과 맞춤형 여행 계획을 위한 정보를 입력해주세요.',
];

export const SignupScreenView = ({
  step,
  totalSteps,
  form,
  errors,
  focusSeq,
  isPasswordVisible,
  isConfirmPasswordVisible,
  isSendingEmail,
  isVerifying,
  isSubmitting,
  isEmailFormatValid,
  showVerificationInput,
  isEmailVerified,
  isCodeExpired,
  resendCooldown,
  nicknameStatus,
  focusedField,
  timeLeft,
  passwordRequirements,
  isPasswordMatch,
  isNextEnabled,
  isAgreed,
  onChangeAgreement,
  onChange,
  onSendEmail,
  onEditEmail,
  onNextStep,
  onPrevStep,
  setFocusedField,
  setIsPasswordVisible,
  setIsConfirmPasswordVisible,
  formatTime,
}: SignupScreenViewProps) => {
  const insets = useSafeAreaInsets();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);

  /** 단계가 늘었는지 줄었는지에 따라 들어오는 방향을 바꾼다. */
  const prevStepRef = useRef(step);
  const goingForward = step >= prevStepRef.current;
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  /**
   * 최초 진입(화면 push 직후)과 단계 간 전환을 다른 모션으로 구분한다.
   * 최초 진입은 화면 슬라이드와 축이 겹치지 않게 revealStep으로,
   * 이후 단계 전환만 기존 수평 슬라이드를 쓴다.
   */
  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
  const stepEntering = hasMountedRef.current
    ? (goingForward ? FadeInRight : FadeInLeft).duration(220)
    : revealStep(1, PUSH_TRANSITION_MS);

  /**
   * 오류가 있으면 그 필드로, 없으면 이번 단계의 첫 필드로 포커스를 옮긴다.
   * 단계 내용이 먼저 붙어야 ref가 살아 있으므로 한 프레임 뒤에 실행한다.
   */
  useEffect(() => {
    if (focusSeq === 0) return;
    const id = setTimeout(() => {
      if (errors.email) return emailRef.current?.focus();
      if (errors.verificationCode) return codeRef.current?.focus();
      if (errors.password) return passwordRef.current?.focus();
      if (errors.confirmPassword) return confirmRef.current?.focus();
      if (errors.nickname) return nicknameRef.current?.focus();

      if (step === 1) {
        return showVerificationInput && !isEmailVerified
          ? codeRef.current?.focus()
          : emailRef.current?.focus();
      }
      if (step === 2) return passwordRef.current?.focus();
      if (step === 3) return nicknameRef.current?.focus();
    }, 120);
    return () => clearTimeout(id);
    // errors·step은 focusSeq와 함께 갱신된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq]);

  const emailLocked = showVerificationInput || isEmailVerified;
  const isBusy = isSendingEmail || isVerifying || isSubmitting;

  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  const codeState: FieldState = errors.verificationCode
    ? 'error'
    : isEmailVerified
    ? 'success'
    : focusedField === 'verificationCode'
    ? 'focus'
    : 'default';

  const nicknameState: FieldState =
    errors.nickname || nicknameStatus === 'taken'
      ? 'error'
      : nicknameStatus === 'available'
      ? 'success'
      : focusedField === 'nickname'
      ? 'focus'
      : 'default';

  const nicknameHint = () => {
    if (nicknameStatus === 'checking') {
      return (
        <View style={styles.statusRow}>
          <Loader size={sf(14)} color={COLORS.textSecondary} />
          <Text style={styles.statusTextMuted}>확인 중…</Text>
        </View>
      );
    }
    if (nicknameStatus === 'available') {
      return (
        <Animated.View
          style={styles.statusRow}
          entering={FadeInDown.duration(160)}
        >
          <Check size={sf(14)} color={COLORS.success} strokeWidth={3} />
          <Text style={styles.statusTextOk}>사용할 수 있는 닉네임이에요.</Text>
        </Animated.View>
      );
    }
    if (nicknameStatus === 'taken') {
      return (
        <Animated.View
          style={styles.statusRow}
          entering={FadeInDown.duration(160)}
        >
          <AlertCircle size={sf(14)} color={COLORS.error} />
          <Text style={styles.statusTextError}>
            이미 사용 중인 닉네임이에요.
          </Text>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── 헤더: 뒤로가기는 항상 왼쪽 ── */}
      <Animated.View style={styles.header} entering={revealStep(0, PUSH_TRANSITION_MS)}>
        <Pressable
          style={styles.headerBackButton}
          onPress={onPrevStep}
          disabled={isBusy}
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
      </Animated.View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={stepEntering}
          exiting={FadeOut.duration(180)}
        >
          <Text style={styles.title}>{STEP_TITLES[step - 1]}</Text>
          <Text style={styles.description}>{STEP_DESCRIPTIONS[step - 1]}</Text>

          {/* ══ 1단계: 이메일 인증 ══ */}
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <View style={styles.fieldRow}>
                  <AuthFieldBox
                    state={fieldState(!!errors.email, focusedField === 'email')}
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
                        {form.email}
                      </Text>
                    ) : (
                      <TextInput
                        ref={emailRef}
                        style={styles.authInput}
                        placeholder="example@email.com"
                        placeholderTextColor={COLORS.textSecondary}
                        value={form.email}
                        onChangeText={v => onChange('email', v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete="email"
                        importantForAutofill="yes"
                        returnKeyType="send"
                        onSubmitEditing={onSendEmail}
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
                      onPress={onSendEmail}
                      disabled={!isEmailFormatValid || isSendingEmail}
                      accessibilityRole="button"
                      accessibilityLabel="인증번호 요청"
                    >
                      {isSendingEmail ? (
                        <ActivityIndicator
                          color={COLORS.onPrimary}
                          size="small"
                        />
                      ) : (
                        <Text style={styles.inlineButtonText}>인증요청</Text>
                      )}
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
                        value={form.verificationCode}
                        onChangeText={v =>
                          onChange('verificationCode', v.replace(/[^0-9]/g, ''))
                        }
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
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                        />
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
                        onPress={onSendEmail}
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

          {/* ══ 2단계: 비밀번호 ══ */}
          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={fieldState(
                    !!errors.password,
                    focusedField === 'password',
                  )}
                  style={styles.authInputContainer}
                  label="비밀번호"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={passwordRef}
                      style={styles.authInput}
                      value={form.password}
                      placeholder="8자 이상"
                      placeholderTextColor={COLORS.textSecondary}
                      onChangeText={v => onChange('password', v)}
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      importantForAutofill="yes"
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => confirmRef.current?.focus()}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="비밀번호"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setIsPasswordVisible(v => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시'
                      }
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </AuthFieldBox>
                {!!errors.password && <InlineError message={errors.password} />}
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={passwordRequirements.hasMinLength}
                    label="8자 이상"
                  />
                  <PasswordRequirement
                    met={passwordRequirements.hasCombination}
                    label="영문 · 숫자 · 특수문자 포함"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={fieldState(
                    !!errors.confirmPassword,
                    focusedField === 'confirmPassword',
                  )}
                  style={styles.authInputContainer}
                  label="비밀번호 확인"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={confirmRef}
                      style={styles.authInput}
                      value={form.confirmPassword}
                      placeholder="다시 한 번 입력해 주세요"
                      placeholderTextColor={COLORS.textSecondary}
                      onChangeText={v => onChange('confirmPassword', v)}
                      secureTextEntry={!isConfirmPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      importantForAutofill="yes"
                      returnKeyType="done"
                      onSubmitEditing={onNextStep}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="비밀번호 확인"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setIsConfirmPasswordVisible(v => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isConfirmPasswordVisible
                          ? '비밀번호 숨기기'
                          : '비밀번호 표시'
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </AuthFieldBox>
                {!!errors.confirmPassword && (
                  <InlineError message={errors.confirmPassword} />
                )}
                {form.confirmPassword.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <PasswordRequirement
                      met={isPasswordMatch}
                      label="비밀번호 일치"
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {/* ══ 3단계: 닉네임 & 내 정보 ══ */}
          {step === 3 && (
            <>
              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={nicknameState}
                  style={styles.authInputContainer}
                  label="닉네임"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={nicknameRef}
                      style={styles.authInput}
                      placeholder="플랜메이트"
                      placeholderTextColor={COLORS.textSecondary}
                      value={form.nickname}
                      onChangeText={v => onChange('nickname', v)}
                      autoComplete="username"
                      importantForAutofill="yes"
                      returnKeyType="next"
                      onSubmitEditing={() => setBirthdatePickerOpen(true)}
                      maxLength={20}
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="닉네임"
                    />
                  </View>
                </AuthFieldBox>
                {!!errors.nickname && <InlineError message={errors.nickname} />}
                {!errors.nickname && nicknameHint()}
              </View>

              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={errors.birthdate ? 'error' : 'default'}
                  style={styles.authInputContainer}
                  label="생년월일"
                >
                  <TouchableOpacity
                    style={styles.authInputRow}
                    onPress={() => setBirthdatePickerOpen(true)}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="생년월일 선택"
                  >
                    <Text
                      style={[
                        styles.authInput,
                        !form.birthdate && styles.authInputPlaceholder,
                      ]}
                    >
                      {form.birthdate
                        ? formatBirthdate(form.birthdate)
                        : '생년월일 선택'}
                    </Text>
                  </TouchableOpacity>
                </AuthFieldBox>
                {!!errors.birthdate && (
                  <InlineError message={errors.birthdate} />
                )}
              </View>

              {/*
                성별은 값을 적는 칸이 아니라 고르는 컨트롤이다. 입력 칸 테두리로
                한 번 더 감싸면 테두리 안의 테두리가 되어 무거워진다.
                라벨만 밖에 두고 버튼을 바로 놓는다.
              */}
              <View style={styles.inputGroup}>
                <Text style={styles.groupLabel}>성별</Text>
                <View style={styles.genderContainer}>
                  {(
                    [
                      { key: 'male', label: '남성' },
                      { key: 'female', label: '여성' },
                    ] as const
                  ).map(option => (
                    <PressableScale
                      key={option.key}
                      style={[
                        styles.genderButton,
                        !!errors.gender && styles.genderButtonError,
                        form.gender === option.key &&
                          styles.genderButtonSelected,
                      ]}
                      baseColor={
                        form.gender === option.key
                          ? COLORS.primary
                          : COLORS.surfaceRaised
                      }
                      pressedColor={
                        form.gender === option.key
                          ? COLORS.primaryPressed
                          : COLORS.surface
                      }
                      scaleTo={0.96}
                      onPress={() => onChange('gender', option.key)}
                      accessibilityRole="radio"
                      accessibilityState={{
                        selected: form.gender === option.key,
                      }}
                      accessibilityLabel={option.label}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          form.gender === option.key &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
                {!!errors.gender && <InlineError message={errors.gender} />}
              </View>

              {/* 개인정보 수집 및 이용 동의 — 체크박스와 보기 링크를 분리한다 */}
              <View style={styles.agreementRow}>
                <Pressable
                  testID="agreement-checkbox"
                  style={styles.checkboxHit}
                  onPress={() => onChangeAgreement(!isAgreed)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isAgreed }}
                  accessibilityLabel="개인정보 수집 및 이용 동의, 필수"
                >
                  <View
                    style={[styles.checkbox, isAgreed && styles.checkboxActive]}
                  >
                    {isAgreed && (
                      <Check
                        size={sf(13)}
                        color={COLORS.onPrimary}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                  <Text style={styles.agreementText}>
                    개인정보 수집·이용에 동의합니다{' '}
                    <Text style={styles.requiredText}>(필수)</Text>
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.agreementViewButton}
                  onPress={() => setShowPrivacyModal(true)}
                  accessibilityRole="button"
                  accessibilityLabel="개인정보 수집 및 이용 약관 보기"
                >
                  <Text style={styles.agreementViewText}>보기</Text>
                </Pressable>
              </View>
              {!!errors.agreement && <InlineError message={errors.agreement} />}
              {!!errors.form && <InlineError message={errors.form} />}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── 하단: 주 버튼은 항상 '다음' 하나 ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + sf(16) }]}>
        <AuthSubmitButton
          label={step === totalSteps ? '회원가입 완료' : '다음'}
          onPress={onNextStep}
          loading={isSubmitting}
          muted={!isNextEnabled}
          disabled={isBusy}
        />
      </View>

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        variant="consent"
      />

      {/* 생년월일 선택기. 나이를 받아 역산하면 실제 월·일이 소실된다. */}
      <DatePicker
        modal
        mode="date"
        title="생년월일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
        maximumDate={new Date()}
        open={isBirthdatePickerOpen}
        date={parseBirthdate(form.birthdate)}
        onConfirm={date => {
          setBirthdatePickerOpen(false);
          onChange('birthdate', toBirthdateString(date));
        }}
        onCancel={() => setBirthdatePickerOpen(false)}
      />
    </View>
  );
};
