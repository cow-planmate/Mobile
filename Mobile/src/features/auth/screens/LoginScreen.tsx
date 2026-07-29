import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { LoginScreenView } from './LoginScreen.view';
import { API_URL } from '@env';
import { resolveApiUrl } from '../../../utils/apiUrl';

type LoginScreenProps = {
  navigation: { navigate: (screen: string, params?: any) => void };
};

/**
 * 로그인 화면 프레젠테이션 및 폼 인증/SNS OAuth 로그인 컨테이너 컴포넌트
 *
 * @param props navigation 네비게이션 프로퍼티
 */
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [serverError, setServerError] = useState<{
    field: 'email' | 'password' | 'all' | null;
    message: string | null;
  }>({ field: null, message: null });
  const login = useAuthStore((state) => state.login);
  const oauthLogin = useAuthStore((state) => state.oauthLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { showAlert } = useAlert();
  const [snsAuthUrl, setSnsAuthUrl] = useState<string | null>(null);

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
    setSnsAuthUrl(resolveApiUrl('/api/oauth/google'));
  };

  const handleNaverLogin = () => {
    setSnsAuthUrl(resolveApiUrl('/api/oauth/naver'));
  };

  const handleSnsNavigationStateChange = async (navState: any) => {
    const url = navState.url;
    if (url.includes('status=SUCCESS') || url.includes('status=NEED_ADDITIONAL_INFO') || url.includes('status=FAIL')) {
      setSnsAuthUrl(null);
      // parse query strings
      const queryParams = url.split('?')[1];
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        const status = params.get('status');
        if (status === 'SUCCESS') {
          const code = params.get('code');
          if (code) {
            try {
              await oauthLogin(code);
            } catch (e: any) {
              Toast.show({
                type: 'error',
                text1: '소셜 로그인 실패',
                position: 'top',
                visibilityTime: 2500,
              });
            }
          }
        } else if (status === 'NEED_ADDITIONAL_INFO') {
          const signupId = params.get('signupId');
          const needEmailStr = params.get('needEmail');
          const needEmail = needEmailStr === 'true';
          if (signupId) {
            navigation.navigate('OAuthAdditionalInfo', { signupId, needEmail });
          } else {
            showAlert({ title: '오류', message: '가입 세션 정보가 올바르지 않습니다.' });
          }
        } else {
          showAlert({ title: '오류', message: '소셜 로그인 중 오류가 발생했습니다.' });
        }
      }
    }
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
      snsAuthUrl={snsAuthUrl}
      onSnsClose={() => setSnsAuthUrl(null)}
      onSnsNavigationStateChange={handleSnsNavigationStateChange}
    />
  );
}






