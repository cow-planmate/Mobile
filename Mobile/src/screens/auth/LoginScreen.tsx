import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { LoginScreenView } from './LoginScreen.view';

type LoginScreenProps = {
  navigation: { navigate: (screen: string) => void };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [serverError, setServerError] = useState<{
    field: 'email' | 'password' | 'all' | null;
    message: string | null;
  }>({ field: null, message: null });
  const { login, isLoading } = useAuth();
  const { showAlert } = useAlert();

  const isEmailValid =
    (form.email.length === 0 ||
      /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/.test(form.email)) &&
    serverError.field !== 'email' &&
    serverError.field !== 'all';
  const isPasswordValid =
    (form.password.length === 0 || form.password.length >= 4) &&
    serverError.field !== 'password' &&
    serverError.field !== 'all';

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (serverError.field === key || serverError.field === 'all') {
      setServerError({ field: null, message: null });
    }
  };

  const handleClearPassword = () => {
    setForm(prev => ({ ...prev, password: '' }));
  };

  const handleLogin = async () => {
    const email = form.email.trim();
    if (!email || !form.password) {
      Toast.show({
        type: 'error',
        text1: '입력되지 않은 항목이 있어요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: '이메일 형식이 올바르지 않아요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    if (form.password.length < 4) {
      Toast.show({
        type: 'error',
        text1: '비밀번호는 최소 4자리 이상이어야 해요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      await login(email, form.password);
    } catch (e: any) {
      if (e.message && e.message.includes('올바르지 않습니다')) {
        setServerError({ field: 'all', message: e.message });
      }
      Toast.show({
        type: 'error',
        text1: e.message && e.message.includes('올바르지 않습니다')
          ? '가입된 정보가 없거나 비밀번호가 맞지 않아요.'
          : (e.message || '로그인 처리 중 문제가 발생했어요.'),
        position: 'top',
        visibilityTime: 2500,
      });
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
      isLoading={isLoading}
      focused={focused}
      isEmailValid={isEmailValid}
      isPasswordValid={isPasswordValid}
      onChange={handleChange}
      onLogin={handleLogin}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onClearPassword={handleClearPassword}
      onNavigateToSignup={() => navigation.navigate('Signup')}
      onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
      onGoogleLogin={handleGoogleLogin}
      onNaverLogin={handleNaverLogin}
    />
  );
}






