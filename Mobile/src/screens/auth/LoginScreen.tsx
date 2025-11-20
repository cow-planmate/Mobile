import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const COLORS = {
  primary: '#1344FF',
  secondary: '#5AC8FA',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  error: '#FF3B30',
  gradientStart: '#e0e7ff',
  gradientEnd: '#f8fafc',
};

type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || '로그인 중 오류가 발생했습니다.');
      Alert.alert('로그인 실패', e.message || '다시 시도해주세요.');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      setError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>로그인</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused,
            ]}
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            editable={!isLoading}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'password' && styles.inputFocused,
            ]}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            editable={!isLoading}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <Pressable
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>로그인</Text>
          )}
        </Pressable>

        <View style={styles.linksContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: COLORS.text,
    letterSpacing: 1,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFD2D2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  submitButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 28,
    paddingHorizontal: 8,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});
