import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { LoginScreenView, LoginErrors } from './LoginScreen.view';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { resolveSnsFailMessage } from '../snsFailMessage';
import { isTrustedSnsCallbackUrl } from '../snsCallback';
import {
  parseBackendError,
  getDisplayErrorMessage,
} from '../../../utils/errorHandler';
import { useSubmitLock } from '../../../hooks/useSubmitLock';

const INVALID_CREDENTIALS_CODE = 'AUTH_003';

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

type LoginScreenProps = {
  navigation: { navigate: (screen: string, params?: any) => void };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const lastLoginEmail = useAuthStore(state => state.lastLoginEmail);
  const [form, setForm] = useState({ email: lastLoginEmail || '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);

  const [errors, setErrors] = useState<LoginErrors>({});
  const [focusSeq, setFocusSeq] = useState(0);

  const login = useAuthStore(state => state.login);
  const oauthLogin = useAuthStore(state => state.oauthLogin);
  const isLoading = useAuthStore(state => state.isLoading);
  const lastLoginMethod = useAuthStore(state => state.lastLoginMethod);
  const { showAlert } = useAlert();
  const [snsAuthUrl, setSnsAuthUrl] = useState<string | null>(null);

  const [snsProvider, setSnsProvider] = useState<'google' | 'naver' | null>(null);

  const handledSnsUrlRef = useRef<string | null>(null);

  React.useEffect(() => {
    if (!lastLoginEmail) return;
    setForm(prev => (prev.email ? prev : { ...prev, email: lastLoginEmail }));
  }, [lastLoginEmail]);

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      if (!prev[key] && !prev.form) return prev;
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const { runExclusive: runLoginExclusive } = useSubmitLock();

  const handleLogin = () =>
    runLoginExclusive(async () => {
      const email = form.email.trim();
      const next: LoginErrors = {};

      if (!email) {
        next.email = '이메일을 입력해 주세요.';
      } else if (!EMAIL_REGEX.test(email)) {
        next.email = '이메일 형식을 확인해 주세요.';
      }

      if (!form.password) {
        next.password = '비밀번호를 입력해 주세요.';
      }

      if (next.email || next.password) {
        setErrors(next);
        setFocusSeq(seq => seq + 1);
        return;
      }

      setErrors({});

      try {
        await login(email, form.password);
      } catch (e) {

        const { code } = parseBackendError(e);
        const isBadCredentials = code === INVALID_CREDENTIALS_CODE;

        setErrors({
          form: isBadCredentials
            ? '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.'
            : getDisplayErrorMessage(
                e,
                '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.',
              ),
        });
        setFocusSeq(seq => seq + 1);
      }
    });

  const startSnsLogin = (provider: 'google' | 'naver') => {
    handledSnsUrlRef.current = null;
    setSnsProvider(provider);
    setSnsAuthUrl(resolveApiUrl(`/api/oauth/${provider}`));
  };

  const handleGoogleLogin = () => startSnsLogin('google');

  const handleNaverLogin = () => startSnsLogin('naver');

  const handleSnsNavigationStateChange = async (navState: any) => {
    const url = navState.url;

    // code는 토큰으로 교환되는 자격 증명이므로 우리 API와 같은 출처에서 온
    // 콜백만 처리한다.
    if (!isTrustedSnsCallbackUrl(url, resolveApiUrl(''))) return;

    if (
      url.includes('status=SUCCESS') ||
      url.includes('status=NEED_ADDITIONAL_INFO') ||
      url.includes('status=FAIL')
    ) {
      if (handledSnsUrlRef.current === url) return;
      handledSnsUrlRef.current = url;

      setSnsAuthUrl(null);

      const queryParams = url.split('?')[1];
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        const status = params.get('status');
        if (status === 'SUCCESS') {
          const code = params.get('code');
          if (code) {
            try {

              await oauthLogin(code, snsProvider);
            } catch (e) {

              setErrors({
                form: getDisplayErrorMessage(
                  e,
                  '소셜 로그인에 실패했어요. 다시 시도해 주세요.',
                ),
              });
            }
          } else {
            showAlert({
              title: '오류',
              message: '소셜 로그인 정보가 올바르지 않아요.',
            });
          }
        } else if (status === 'NEED_ADDITIONAL_INFO') {
          const signupId = params.get('signupId');
          const needEmailStr = params.get('needEmail');
          const needEmail = needEmailStr === 'true';
          if (signupId) {
            navigation.navigate('OAuthAdditionalInfo', {
              signupId,
              needEmail,
              provider: snsProvider,
            });
          } else {
            showAlert({
              title: '오류',
              message: '가입 세션 정보가 올바르지 않아요.',
            });
          }
        } else {
          showAlert({
            title: '오류',
            message: resolveSnsFailMessage(params.get('reason')),
          });
        }
      }
    }
  };

  return (
    <LoginScreenView
      form={form}
      errors={errors}
      focusSeq={focusSeq}
      isLoading={isLoading}
      focused={focused}
      onChange={handleChange}
      onLogin={handleLogin}
      onFocus={setFocused}
      onBlur={() => setFocused(null)}
      onNavigateToSignup={() => navigation.navigate('Signup')}
      onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
      onGoogleLogin={handleGoogleLogin}
      onNaverLogin={handleNaverLogin}
      lastLoginMethod={lastLoginMethod}
      snsAuthUrl={snsAuthUrl}
      onSnsClose={() => setSnsAuthUrl(null)}
      onSnsNavigationStateChange={handleSnsNavigationStateChange}
    />
  );
}
