import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import X from 'lucide-react-native/dist/esm/icons/x';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import Svg, { Path, Rect } from 'react-native-svg';
import { styles } from './LoginScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../utils/normalize';
import { revealStep, PUSH_TRANSITION_MS } from '../motion';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';
import FormErrorBanner from '../components/FormErrorBanner';

const GoogleIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
      fill="#FFC107"
    />
    <Path
      d="M5.3 14.7l7.1 5.2C14.1 16.2 18.6 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 6.1 29.6 4 24 4 15.4 4 8.1 8.7 5.3 14.7z"
      fill="#FF3D00"
    />
    <Path
      d="M24 44c5.2 0 9.9-1.8 13.4-4.7l-6.2-5.2c-2 1.6-4.6 2.4-7.2 2.4-6 0-11.1-4-12.8-9.5l-7 5.4C7.2 39.2 14.9 44 24 44z"
      fill="#4CAF50"
    />
    <Path
      d="M44.5 20H24v8.5h11.8c-1 3.1-3.1 5.6-5.8 7.3l6.2 5.2C40 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z"
      fill="#1976D2"
    />
  </Svg>
);

const NaverIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="8" fill="#03C75A" />
    <Path
      d="M28.4 25.2L19.2 12H12v24h7.6V22.8L28.8 36H36V12h-7.6v13.2z"
      fill="white"
    />
  </Svg>
);

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

export interface LoginErrors {
  email?: string;
  password?: string;

  form?: string;
}

export interface LoginScreenViewProps {
  form: { email: string; password: string };
  errors: LoginErrors;

  focusSeq: number;
  isLoading: boolean;
  focused: string | null;
  onChange: (key: 'email' | 'password', value: string) => void;
  onLogin: () => void;
  onFocus: (key: string) => void;
  onBlur: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onGoogleLogin: () => void;
  onNaverLogin: () => void;

  lastLoginMethod: 'email' | 'google' | 'naver' | null;
  snsAuthUrl: string | null;
  onSnsClose: () => void;
  onSnsNavigationStateChange: (navState: any) => void;
}

export const LoginScreenView = ({
  form,
  errors,
  focusSeq,
  isLoading,
  focused,
  onChange,
  onLogin,
  onFocus,
  onBlur,
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onGoogleLogin,
  onNaverLogin,
  lastLoginMethod,
  snsAuthUrl,
  onSnsClose,
  onSnsNavigationStateChange,
}: LoginScreenViewProps) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (focusSeq === 0) return;
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq]);

  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  const socialOptions = useMemo(() => {
    const options = [
      {
        method: 'google' as const,
        label: 'Google로 계속하기',
        icon: <GoogleIcon size={20} />,
        onPress: onGoogleLogin,
      },
      {
        method: 'naver' as const,
        label: '네이버로 계속하기',
        icon: <NaverIcon size={20} />,
        onPress: onNaverLogin,
      },
    ];

    return options.sort((a, b) =>
      a.method === lastLoginMethod ? -1 : b.method === lastLoginMethod ? 1 : 0,
    );
  }, [lastLoginMethod, onGoogleLogin, onNaverLogin]);

  const emailState = fieldState(
    !!errors.email || !!errors.form,
    focused === 'email',
  );
  const passwordState = fieldState(
    !!errors.password || !!errors.form,
    focused === 'password',
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.Text
          style={styles.title}
          entering={revealStep(0, PUSH_TRANSITION_MS)}
        >
          로그인
        </Animated.Text>

        <Animated.View entering={revealStep(1, PUSH_TRANSITION_MS)}>

          {!!errors.form && <FormErrorBanner message={errors.form} />}

          <View style={styles.inputGroup}>
            <AuthFieldBox
              state={emailState}
              style={styles.inputContainer}
              label="이메일"
            >
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="example@email.com"
                value={form.email}
                onChangeText={text => onChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="email"
                importantForAutofill="yes"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => onFocus('email')}
                onBlur={onBlur}
                editable={!isLoading}
                placeholderTextColor={COLORS.textSecondary}
                accessibilityLabel="이메일"
              />
            </AuthFieldBox>
            {!!errors.email && <InlineError message={errors.email} />}
          </View>

          <View style={styles.inputGroup}>
            <AuthFieldBox
              state={passwordState}
              style={styles.passwordContainer}
              label="비밀번호"
            >
              <View style={styles.passwordContent}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  value={form.password}
                  onChangeText={text => onChange('password', text)}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  importantForAutofill="yes"
                  returnKeyType="go"
                  onSubmitEditing={onLogin}
                  onFocus={() => onFocus('password')}
                  onBlur={onBlur}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textSecondary}
                  accessibilityLabel="비밀번호"
                />
              </View>
              <Pressable
                style={styles.eyeButton}
                onPress={() => setPasswordVisible(v => !v)}
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
            </AuthFieldBox>
            {!!errors.password && <InlineError message={errors.password} />}

            <View style={styles.fieldAssistRow}>
              <Pressable
                style={styles.linkButton}
                onPress={onNavigateToForgotPassword}
                disabled={isLoading}
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.linkText}>비밀번호를 잊으셨나요?</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.submitButtonWrapper}>
            {lastLoginMethod === 'email' && (
              <View style={styles.lastUsedTooltip}>
                <Text style={styles.lastUsedTooltipText}>최근 로그인</Text>
              </View>
            )}
            <AuthSubmitButton
              label="로그인"
              onPress={onLogin}
              loading={isLoading}
              muted={!form.email || !form.password}
            />
          </View>

          <View style={styles.socialContainer}>
            <View style={styles.socialDivider}>
              <View style={styles.socialDividerLine} />
              <Text style={styles.socialDividerText}>소셜 계정으로 로그인</Text>
              <View style={styles.socialDividerLine} />
            </View>
            <View style={styles.socialButtons}>
              {socialOptions.map(option => {
                const isLastUsed = lastLoginMethod === option.method;
                return (
                  <View key={option.method} style={styles.socialButtonWrapper}>
                    {isLastUsed && (
                      <View style={styles.lastUsedTooltip}>
                        <Text style={styles.lastUsedTooltipText}>최근 로그인</Text>
                      </View>
                    )}
                    <PressableScale
                      style={[
                        styles.socialButton,
                        isLastUsed && styles.socialButtonHighlighted,
                      ]}
                      baseColor={COLORS.surfaceRaised}
                      pressedColor={COLORS.surface}
                      scaleTo={0.98}
                      onPress={option.onPress}
                      disabled={isLoading}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isLastUsed
                          ? `${option.label}, 최근 사용한 로그인 수단`
                          : option.label
                      }
                    >
                      {option.icon}
                      <Text style={styles.socialButtonText}>{option.label}</Text>
                    </PressableScale>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.linkText}>계정이 없으신가요?</Text>
            <Pressable
              style={styles.linkButton}
              onPress={onNavigateToSignup}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="회원가입"
            >
              <Text style={[styles.linkText, styles.linkTextStrong]}>
                회원가입
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {snsAuthUrl && (
        <Modal
          visible={true}
          transparent={false}
          animationType="slide"
          onRequestClose={onSnsClose}
        >
          <View style={styles.snsContainer}>
            <View style={styles.snsHeader}>
              <TouchableOpacity
                onPress={onSnsClose}
                style={styles.snsCloseButton}
                accessibilityRole="button"
                accessibilityLabel="소셜 로그인 취소"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: snsAuthUrl }}
              onNavigationStateChange={onSnsNavigationStateChange}
              startInLoadingState={true}
              userAgent={
                Platform.OS === 'ios'
                  ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
                  : 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
              }
              renderLoading={() => (
                <View style={styles.snsLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};
