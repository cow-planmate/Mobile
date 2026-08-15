import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { LoginScreenView, LoginErrors } from './LoginScreen.view';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { resolveSnsFailMessage } from '../snsFailMessage';
import {
  parseBackendError,
  getDisplayErrorMessage,
} from '../../../utils/errorHandler';

/** 이메일 또는 비밀번호가 틀렸을 때 서버가 주는 코드 (AUTH_003) */
const INVALID_CREDENTIALS_CODE = 'AUTH_003';

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

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

  /**
   * 오류는 필드에 붙여 화면에 계속 띄운다.
   * 예전에는 2.5초 뒤 사라지는 토스트만 띄우고 테두리만 붉게 남겨서,
   * 문구를 놓치면 무엇이 잘못됐는지 알 방법이 없었다.
   */
  const [errors, setErrors] = useState<LoginErrors>({});
  const [focusSeq, setFocusSeq] = useState(0);

  const login = useAuthStore(state => state.login);
  const oauthLogin = useAuthStore(state => state.oauthLogin);
  const isLoading = useAuthStore(state => state.isLoading);
  const lastLoginMethod = useAuthStore(state => state.lastLoginMethod);
  const { showAlert } = useAlert();
  const [snsAuthUrl, setSnsAuthUrl] = useState<string | null>(null);
  /** WebView가 성공 콜백으로 돌아왔을 때 어느 제공자였는지 알아야 lastLoginMethod를 기록할 수 있다 */
  const [snsProvider, setSnsProvider] = useState<'google' | 'naver' | null>(null);
  /**
   * 이미 처리한 콜백 URL.
   *
   * onNavigationStateChange는 같은 URL에 대해 로드 시작과 완료로 두 번 발화한다.
   * setSnsAuthUrl(null)은 다음 렌더에서야 WebView를 내리므로 그 사이 두 번째
   * 이벤트가 통과할 수 있는데, 서버 loginCode는 1회용이라(Redis consume) 두 번째
   * 교환은 실패한다. 로그인은 성공했는데 오류 문구만 남는 상황을 막는다.
   */
  const handledSnsUrlRef = useRef<string | null>(null);

  /** 입력을 고치면 그 필드의 오류와 폼 전체 오류를 함께 지운다. */
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

  const handleLogin = async () => {
    const email = form.email.trim();
    const next: LoginErrors = {};

    if (!email) {
      next.email = '이메일을 입력해 주세요.';
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = '이메일 형식을 확인해 주세요.';
    }

    // 비밀번호는 길이를 검사하지 않는다. 정책이 바뀌기 전에 가입한 계정을
    // 클라이언트가 먼저 막아버리기 때문에, 맞고 틀림은 서버가 판단한다.
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
      // 문구가 아니라 에러 코드로 판단한다. 백엔드가 메시지를 다듬어도 깨지지 않는다.
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
  };

  const startSnsLogin = (provider: 'google' | 'naver') => {
    handledSnsUrlRef.current = null;
    setSnsProvider(provider);
    setSnsAuthUrl(resolveApiUrl(`/api/oauth/${provider}`));
  };

  const handleGoogleLogin = () => startSnsLogin('google');

  const handleNaverLogin = () => startSnsLogin('naver');

  const handleSnsNavigationStateChange = async (navState: any) => {
    const url = navState.url;
    if (
      url.includes('status=SUCCESS') ||
      url.includes('status=NEED_ADDITIONAL_INFO') ||
      url.includes('status=FAIL')
    ) {
      if (handledSnsUrlRef.current === url) return;
      handledSnsUrlRef.current = url;

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
              // 제공자를 모르면 기록하지 않는다. 기본값을 두면 네이버 로그인이
              // 구글로 남아 다음 방문에 엉뚱한 버튼에 '마지막 사용'이 붙는다.
              await oauthLogin(code, snsProvider);
            } catch (e) {
              // 가입 세션 만료(OAUTH_002)·이미 가입된 계정(OAUTH_004)처럼 서버가
              // 사유를 구분해 주므로, 있으면 그 문구를 그대로 쓴다.
              setErrors({
                form: getDisplayErrorMessage(
                  e,
                  '소셜 로그인에 실패했어요. 다시 시도해 주세요.',
                ),
              });
            }
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
              message: '가입 세션 정보가 올바르지 않습니다.',
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
