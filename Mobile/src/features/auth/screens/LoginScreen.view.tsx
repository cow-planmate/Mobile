import React, { useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { styles } from './LoginScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../design/scale';
import { revealStep, PUSH_TRANSITION_MS } from '../motion';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

/* ── Inline SVG icons for social login ── */

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

/* ── 인라인 오류 한 줄 ── */

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

export interface LoginErrors {
  email?: string;
  password?: string;
  /** 어느 필드에도 귀속되지 않는 오류 (자격 증명 불일치, 네트워크 등) */
  form?: string;
}

export interface LoginScreenViewProps {
  form: { email: string; password: string };
  errors: LoginErrors;
  /** 검증 실패 시 증가한다. 값이 바뀌면 첫 번째 문제 필드로 포커스를 옮긴다. */
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
  /** 가장 최근에 로그인을 성공시킨 수단. 해당 버튼에 '마지막 사용' 배지를 띄운다 */
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
  const insets = useSafeAreaInsets();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  /**
   * 검증에 걸린 첫 필드로 포커스를 옮긴다.
   * 오류 객체가 아니라 focusSeq를 보는 이유는, 같은 오류가 다시 나도(같은 값으로
   * 재시도) 포커스가 움직여야 하기 때문이다.
   */
  useEffect(() => {
    if (focusSeq === 0) return;
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    // errors는 focusSeq와 함께 갱신되므로 의존성에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq]);

  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  const emailState = fieldState(
    !!errors.email || !!errors.form,
    focused === 'email',
  );
  const passwordState = fieldState(
    !!errors.password || !!errors.form,
    focused === 'password',
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + sf(24) },
        ]}
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
            {!!errors.form && <InlineError message={errors.form} />}
          </View>

          <AuthSubmitButton
            label="로그인"
            onPress={onLogin}
            loading={isLoading}
            style={styles.submitButtonSpacing}
          />

          <View style={styles.linksContainer}>
            <Pressable
              style={styles.linkButton}
              onPress={onNavigateToForgotPassword}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>비밀번호를 잊으셨나요?</Text>
            </Pressable>
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <View style={styles.socialDivider}>
              <View style={styles.socialDividerLine} />
              <Text style={styles.socialDividerText}>소셜 계정으로 로그인</Text>
              <View style={styles.socialDividerLine} />
            </View>
            <View style={styles.socialButtons}>
              <PressableScale
                style={styles.socialButton}
                baseColor={COLORS.surfaceRaised}
                pressedColor={COLORS.surface}
                scaleTo={0.98}
                onPress={onGoogleLogin}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  lastLoginMethod === 'google'
                    ? 'Google 계정으로 계속하기, 마지막으로 사용한 로그인 수단'
                    : 'Google 계정으로 계속하기'
                }
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Google로 계속하기</Text>
                {lastLoginMethod === 'google' && (
                  <View style={styles.lastUsedBadge}>
                    <Text style={styles.lastUsedBadgeText}>마지막 사용</Text>
                  </View>
                )}
              </PressableScale>
              <PressableScale
                style={styles.socialButton}
                baseColor={COLORS.surfaceRaised}
                pressedColor={COLORS.surface}
                scaleTo={0.98}
                onPress={onNaverLogin}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  lastLoginMethod === 'naver'
                    ? '네이버 계정으로 계속하기, 마지막으로 사용한 로그인 수단'
                    : '네이버 계정으로 계속하기'
                }
              >
                <NaverIcon size={20} />
                <Text style={styles.socialButtonText}>네이버로 계속하기</Text>
                {lastLoginMethod === 'naver' && (
                  <View style={styles.lastUsedBadge}>
                    <Text style={styles.lastUsedBadgeText}>마지막 사용</Text>
                  </View>
                )}
              </PressableScale>
            </View>
          </View>

          {/*
            계정 없음 안내와 개인정보 링크는 둘 다 화면을 마무리하는 꼬리
            문구다. 각자 독립된 섹션처럼 20dp씩 떨어져 계단을 만들던 것을
            한 덩어리로 묶는다.
          */}
          <View style={styles.tailLinksGroup}>
            <View style={styles.tailLinksRow}>
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

            <Pressable
              onPress={() => setShowPrivacyModal(true)}
              disabled={isLoading}
              style={styles.privacyLinkButton}
              accessibilityRole="button"
            >
              <Text style={styles.privacyLinkText}>개인정보 처리방침</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        variant="policy"
      />

      {snsAuthUrl && (
        <Modal
          visible={true}
          transparent={false}
          animationType="slide"
          onRequestClose={onSnsClose}
        >
          <View
            style={[
              styles.snsContainer,
              { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
          >
            <View style={styles.snsHeader}>
              <TouchableOpacity
                onPress={onSnsClose}
                style={styles.snsCloseButton}
                accessibilityRole="button"
                accessibilityLabel="소셜 로그인 취소"
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
