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
  const { login, isLoading } = useAuth();
  const { showAlert } = useAlert();

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleClearPassword = () => {
    setForm(prev => ({ ...prev, password: '' }));
  };

  const handleLogin = async () => {
    const email = form.email.trim();
    if (!email || !form.password) {
      Toast.show({
        type: 'error',
        text1: '이메일과 비밀번호를 모두 입력해 주세요.',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }
    try {
      await login(email, form.password);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1:
          '계정 정보가 일치하지 않아요. 입력하신 내용을\n다시 확인해 주세요.',
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
