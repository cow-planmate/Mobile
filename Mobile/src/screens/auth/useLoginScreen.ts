import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const useLoginScreen = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await login(form.email, form.password);
    } catch (e: any) {
      const msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      setError(msg);
      Alert.alert('로그인 실패', msg);
    }
  };

  return {
    form,
    error,
    focused,
    isLoading,
    setFocused,
    handleChange,
    handleLogin,
  };
};
