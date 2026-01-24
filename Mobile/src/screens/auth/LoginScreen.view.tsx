import React from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { styles, COLORS } from './LoginScreen.styles';

export interface LoginScreenViewProps {
  form: { email: string; password: '' };
  error: string;
  isLoading: boolean;
  focused: string | null;
  isPasswordVisible: boolean;
  onChange: (key: 'email' | 'password', value: string) => void;
  onLogin: () => void;
  onFocus: (key: string) => void;
  onBlur: () => void;
  onTogglePassword: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreenView = ({
  form,
  error,
  isLoading,
  focused,
  isPasswordVisible,
  onChange,
  onLogin,
  onFocus,
  onBlur,
  onTogglePassword,
  onNavigateToSignup,
  onNavigateToForgotPassword,
}: LoginScreenViewProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={[styles.input, focused === 'email' && styles.inputFocused]}
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
      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호</Text>
        <View
          style={[
            styles.passwordContainer,
            focused === 'password' && styles.inputFocused,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChangeText={text => onChange('password', text)}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => onFocus('password')}
            onBlur={onBlur}
            editable={!isLoading}
            placeholderTextColor={COLORS.darkGray}
          />
          <TouchableOpacity
            onPress={onTogglePassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '숨김' : '보기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
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
          onPress={onNavigateToSignup}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity
          onPress={onNavigateToForgotPassword}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
