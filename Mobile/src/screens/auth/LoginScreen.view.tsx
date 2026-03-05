import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Eye, EyeOff, X } from 'lucide-react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { styles, COLORS, normalize } from './LoginScreen.styles';

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

/* ── Privacy Policy Modal ── */

const PrivacyPolicyModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.privacyOverlay} onPress={onClose}>
      <Pressable style={styles.privacyModal} onPress={e => e.stopPropagation()}>
        <View style={styles.privacyHeader}>
          <Text style={styles.privacyTitle}>개인정보 처리방침</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.privacyScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.privacySectionTitle}>1. 수집·이용 목적</Text>
          <Text style={styles.privacyBullet}>• 회원 관리 및 서비스 제공</Text>
          <Text style={styles.privacyBullet}>• 문의 대응 및 공지사항 전달</Text>
          <Text style={styles.privacyBullet}>
            • 맞춤형 서비스 제공 및 이벤트 안내
          </Text>

          <Text style={styles.privacySectionTitle}>
            2. 수집하는 개인정보 항목
          </Text>
          <Text style={styles.privacyBullet}>
            • 필수 항목: 이메일, 비밀번호, 닉네임, 나이, 성별
          </Text>
          <Text style={styles.privacyBullet}>
            • SNS 계정 로그인 시: 이메일 주소, 프로필 정보(닉네임, 프로필 이미지
            등) 및 서비스 제공에 필요한 최소한의 계정 식별자
          </Text>

          <Text style={styles.privacySectionTitle}>
            3. 개인정보 보유·이용 기간
          </Text>
          <Text style={styles.privacyBullet}>
            • 회원 탈퇴 시 지체 없이 파기
          </Text>
          <Text style={styles.privacyBullet}>
            • 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관
          </Text>

          <Text style={styles.privacySectionTitle}>
            4. 동의 거부 권리 및 불이익 안내
          </Text>
          <Text style={styles.privacyBullet}>
            • 회원가입 시 필수 항목 동의를 거부할 경우 회원가입이 불가합니다.
          </Text>
          <Text style={styles.privacyBullet}>
            • 선택 항목은 동의하지 않아도 회원가입은 가능하며, 일부 서비스
            이용이 제한될 수 있습니다.
          </Text>

          <Text style={styles.privacySectionTitle}>
            5. SNS 계정 로그인 관련 안내
          </Text>
          <Text style={styles.privacyBullet}>
            • 구글 등 외부 SNS 제공자는 OAuth 인증을 통해 로그인 기능만
            제공하며, 회원님의 비밀번호를 당사에 제공하지 않습니다.
          </Text>
          <Text style={styles.privacyBullet}>
            • 당사는 SNS 제공자로부터 제공받은 최소한의 정보(이메일, 프로필 정보
            등)를 회원 식별 및 서비스 제공 목적에 한정하여 이용합니다.
          </Text>
          <Text style={styles.privacyBullet}>
            • SNS 계정 연동 해제 또는 회원 탈퇴 시, 관련 정보는 법령에 따른 보존
            의무가 없는 한 지체 없이 파기됩니다.
          </Text>
        </ScrollView>

        <TouchableOpacity style={styles.privacyCloseButton} onPress={onClose}>
          <Text style={styles.privacyCloseButtonText}>확인</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

/* ── Props ── */

export interface LoginScreenViewProps {
  form: { email: string; password: string };
  isLoading: boolean;
  focused: string | null;
  onChange: (key: 'email' | 'password', value: string) => void;
  onLogin: () => void;
  onFocus: (key: string) => void;
  onBlur: () => void;
  onClearPassword: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onGoogleLogin: () => void;
  onNaverLogin: () => void;
}

export const LoginScreenView = ({
  form,
  isLoading,
  focused,
  onChange,
  onLogin,
  onFocus,
  onBlur,
  onClearPassword,
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onGoogleLogin,
  onNaverLogin,
}: LoginScreenViewProps) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const isButtonEnabled = form.email.length > 0 && form.password.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <View style={styles.inputGroup}>
        <View
          style={[
            styles.inputContainer,
            focused === 'email' && styles.inputFocused,
          ]}
        >
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력하세요"
            value={form.email}
            onChangeText={text => onChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => onFocus('email')}
            onBlur={onBlur}
            editable={!isLoading}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <View
          style={[
            styles.passwordContainer,
            focused === 'password' && styles.inputFocused,
          ]}
        >
          <View style={styles.passwordContent}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChangeText={text => onChange('password', text)}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => onFocus('password')}
              onBlur={onBlur}
              editable={!isLoading}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
          {form.password.length > 0 && (
            <TouchableOpacity
              onPress={onClearPassword}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#C7C7CC',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={12} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (isLoading || !isButtonEnabled) && styles.submitButtonDisabled,
        ]}
        onPress={onLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>로그인</Text>
        )}
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={onNavigateToForgotPassword}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity
          onPress={onNavigateToSignup}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login */}
      <View style={styles.socialContainer}>
        <View style={styles.socialDivider}>
          <View style={styles.socialDividerLine} />
          <Text style={styles.socialDividerText}>소셜 계정으로 로그인</Text>
          <View style={styles.socialDividerLine} />
        </View>
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onNaverLogin}
            disabled={isLoading}
          >
            <NaverIcon size={28} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Policy */}
      <TouchableOpacity
        onPress={() => setShowPrivacyModal(true)}
        disabled={isLoading}
        style={{ marginTop: 24, alignSelf: 'center' }}
      >
        <Text style={styles.privacyLinkText}>개인정보 처리방침</Text>
      </TouchableOpacity>

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
};
