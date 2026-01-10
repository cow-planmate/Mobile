import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { styles, COLORS } from './LoginScreen.styles';

type LoginScreenProps = {
  navigation: { navigate: (screen: string) => void };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login, isLoading } = useAuth();

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleLogin = async () => {
    setError('');
    const email = form.email.trim();
    if (!email || !form.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await login(email, form.password);
    } catch (e: any) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        '이메일 또는 비밀번호가 올바르지 않습니다.';
      setError(msg);
      Alert.alert('로그인 실패', msg);
    }
  };

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
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
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
            onChangeText={text => handleChange('password', text)}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            editable={!isLoading}
            placeholderTextColor={COLORS.darkGray}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '숨김' : '보기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
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
          onPress={() => navigation.navigate('Signup')}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
