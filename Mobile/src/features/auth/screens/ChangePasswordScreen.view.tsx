import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import Check from 'lucide-react-native/dist/esm/icons/check';
import Circle from 'lucide-react-native/dist/esm/icons/circle';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import { styles } from './ChangePasswordScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../design/scale';
import { PASSWORD_MAX_LENGTH } from '../../../utils/passwordPolicy';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';

export interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordScreenViewProps {
  form: ChangePasswordForm;
  errors: ChangePasswordErrors;
  passwordRequirements: { hasMinLength: boolean; hasCombination: boolean };
  isPasswordMatch: boolean;
  isSubmitting: boolean;
  isSubmitEnabled: boolean;
  focusedField: string | null;
  isCurrentVisible: boolean;
  isNewVisible: boolean;
  isConfirmVisible: boolean;
  onChange: (field: keyof ChangePasswordForm, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  setFocusedField: (field: string | null) => void;
  setIsCurrentVisible: (visible: boolean) => void;
  setIsNewVisible: (visible: boolean) => void;
  setIsConfirmVisible: (visible: boolean) => void;
}

/* ── 비밀번호 조건 한 줄 ── */

const PasswordRequirement = React.memo(
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

export const ChangePasswordScreenView = ({
  form,
  errors,
  passwordRequirements,
  isPasswordMatch,
  isSubmitting,
  isSubmitEnabled,
  focusedField,
  isCurrentVisible,
  isNewVisible,
  isConfirmVisible,
  onChange,
  onSubmit,
  onBack,
  setFocusedField,
  setIsCurrentVisible,
  setIsNewVisible,
  setIsConfirmVisible,
}: ChangePasswordScreenViewProps) => {
  const insets = useSafeAreaInsets();
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── 헤더: 뒤로가기는 항상 왼쪽 ── */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerBackButton}
          onPress={onBack}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>비밀번호 변경</Text>
        <Text style={styles.description}>
          현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿉니다.
        </Text>

        <View style={styles.inputGroup}>
          <AuthFieldBox
            state={fieldState(
              !!errors.currentPassword,
              focusedField === 'currentPassword',
            )}
            style={styles.authInputContainer}
            label="현재 비밀번호"
          >
            <View style={styles.authInputRow}>
              <TextInput
                style={styles.authInput}
                placeholderTextColor={COLORS.textSecondary}
                value={form.currentPassword}
                onChangeText={value => onChange('currentPassword', value)}
                secureTextEntry={!isCurrentVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                editable={!isSubmitting}
                onFocus={() => setFocusedField('currentPassword')}
                onBlur={() => setFocusedField(null)}
                accessibilityLabel="현재 비밀번호"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setIsCurrentVisible(!isCurrentVisible)}
                accessibilityRole="button"
                accessibilityLabel={
                  isCurrentVisible
                    ? '현재 비밀번호 가리기'
                    : '현재 비밀번호 보기'
                }
              >
                {isCurrentVisible ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </Pressable>
            </View>
          </AuthFieldBox>
          {!!errors.currentPassword && (
            <InlineError message={errors.currentPassword} />
          )}
        </View>

        <View style={styles.inputGroup}>
          <AuthFieldBox
            state={fieldState(
              !!errors.newPassword,
              focusedField === 'newPassword',
            )}
            style={styles.authInputContainer}
            label="새 비밀번호"
          >
            <View style={styles.authInputRow}>
              <TextInput
                ref={newPasswordRef}
                style={styles.authInput}
                placeholder="8자 이상"
                placeholderTextColor={COLORS.textSecondary}
                value={form.newPassword}
                onChangeText={value => onChange('newPassword', value)}
                secureTextEntry={!isNewVisible}
                maxLength={PASSWORD_MAX_LENGTH}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                editable={!isSubmitting}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                accessibilityLabel="새 비밀번호"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setIsNewVisible(!isNewVisible)}
                accessibilityRole="button"
                accessibilityLabel={
                  isNewVisible ? '새 비밀번호 가리기' : '새 비밀번호 보기'
                }
              >
                {isNewVisible ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </Pressable>
            </View>
          </AuthFieldBox>

          {/* 조건은 입력 전부터 보여 준다. 눌러 보고 나서 알게 하지 않는다. */}
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

          {!!errors.newPassword && <InlineError message={errors.newPassword} />}
        </View>

        <View style={styles.inputGroup}>
          <AuthFieldBox
            state={
              errors.confirmPassword
                ? 'error'
                : isPasswordMatch
                ? 'success'
                : focusedField === 'confirmPassword'
                ? 'focus'
                : 'default'
            }
            style={styles.authInputContainer}
            label="새 비밀번호 확인"
          >
            <View style={styles.authInputRow}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.authInput}
                placeholder="다시 한 번 입력해 주세요"
                placeholderTextColor={COLORS.textSecondary}
                value={form.confirmPassword}
                onChangeText={value => onChange('confirmPassword', value)}
                secureTextEntry={!isConfirmVisible}
                maxLength={PASSWORD_MAX_LENGTH}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                editable={!isSubmitting}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                accessibilityLabel="새 비밀번호 확인"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setIsConfirmVisible(!isConfirmVisible)}
                accessibilityRole="button"
                accessibilityLabel={
                  isConfirmVisible
                    ? '새 비밀번호 확인 가리기'
                    : '새 비밀번호 확인 보기'
                }
              >
                {isConfirmVisible ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </Pressable>
            </View>
          </AuthFieldBox>

          {form.confirmPassword.length > 0 && (
            <View style={styles.requirementsContainer}>
              <PasswordRequirement
                met={isPasswordMatch}
                label="비밀번호 일치"
              />
            </View>
          )}

          {!!errors.confirmPassword && (
            <InlineError message={errors.confirmPassword} />
          )}
        </View>

        {!!errors.form && <InlineError message={errors.form} />}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + sf(16) }]}>
        <AuthSubmitButton
          label="비밀번호 변경"
          onPress={onSubmit}
          loading={isSubmitting}
          muted={!isSubmitEnabled}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

export default ChangePasswordScreenView;
