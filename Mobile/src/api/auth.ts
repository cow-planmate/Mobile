import axios from 'axios';

/**
 * 인증 API.
 *
 * 로그인·회원가입·이메일 인증·토큰 갱신은 각 화면(useAuthStore, SignupScreen,
 * ForgotPasswordScreen, axiosConfig)이 직접 호출한다. 여기에는 화면에서
 * 공유해 쓰는 것만 둔다.
 */

/**
 * 닉네임 중복 확인
 * POST /api/auth/register/nickname/verify — { nicknameAvailable }
 *
 * 서버는 중복 여부만 본다. 길이 규칙은 utils/nickname이 호출 전에 거른다.
 */
export const verifyNicknameAvailable = async (
  nickname: string,
): Promise<boolean> => {
  const { data } = await axios.post<{ nicknameAvailable: boolean }>(
    '/api/auth/register/nickname/verify',
    { nickname },
  );
  return data.nicknameAvailable;
};

/** 비밀번호 변경 요청 (ChangePasswordRequest) */
export interface ChangePasswordRequest {
  currentPassword: string;
  /** 8~64자 */
  newPassword: string;
  /** newPassword와 같아야 한다. 서버가 일치를 검증한다. */
  confirmPassword: string;
}

/**
 * 비밀번호 변경
 * PATCH /api/auth/password — 204 No Content
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> => {
  await axios.patch('/api/auth/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};
