import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
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
  const { showAlert } = useAlert();

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
      showAlert({ title: '로그인 실패', message: msg });
    }
  };

  const handleGoogleLogin = () => {
    showAlert({ title: '소셜 로그인', message: '구글 로그인', type: 'info' });
  };

  const handleNaverLogin = () => {
    showAlert({ title: '소셜 로그인', message: '네이버 로그인', type: 'info' });
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
      onGoogleLogin={handleGoogleLogin}
      onNaverLogin={handleNaverLogin}
    />
  );
}
