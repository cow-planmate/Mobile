import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LoginScreenView } from './LoginScreen.view';

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
    <LoginScreenView
      form={form as any}
      error={error}
      isLoading={isLoading}
      focused={focused}
      isPasswordVisible={isPasswordVisible}
      onChange={handleChange}
      onLogin={handleLogin}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onTogglePassword={() => setIsPasswordVisible(!isPasswordVisible)}
      onNavigateToSignup={() => navigation.navigate('Signup')}
      onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
    />
  );
}
