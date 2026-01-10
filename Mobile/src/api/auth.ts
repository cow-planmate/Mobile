import axios from 'axios';
import { API_URL } from '@env';

// Request/Response 타입 정의 (백엔드 DTO 기반)

// 로그인
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  loginSuccess: boolean;
  userId: number;
  nickname: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

// 로그아웃
export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  logoutSuccess: boolean;
  message?: string;
}

// 회원가입
export interface RegisterRequest {
  nickname: string;
  password: string;
  confirmPassword: string;
  age: number;
  gender: number;
}

export interface RegisterResponse {
  registerSuccess: boolean;
  message?: string;
}

// 이메일 인증 요청
export interface SendEmailRequest {
  email: string;
  purpose: 'SIGN_UP' | 'RESET_PASSWORD';
}

export interface SendEmailResponse {
  sendSuccess: boolean;
  message?: string;
}

// 이메일 인증 확인
export interface EmailVerificationRequest {
  email: string;
  purpose: 'SIGN_UP' | 'RESET_PASSWORD';
  verificationCode: string;
}

export interface EmailVerificationResponse {
  verifySuccess: boolean;
  verificationToken?: string;
  message?: string;
}

// 닉네임 중복 확인
export interface NicknameVerificationRequest {
  nickname: string;
}

export interface NicknameVerificationResponse {
  available: boolean;
  message?: string;
}

// 토큰 갱신
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string | null;
  message?: string;
}

// 비밀번호 변경
export interface ChangePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  changeSuccess: boolean;
  message?: string;
}

// 비밀번호 확인
export interface VerifyPasswordRequest {
  password: string;
}

export interface VerifyPasswordResponse {
  verifySuccess: boolean;
  message?: string;
}

// API 함수들

/**
 * 로그인 API
 * POST /api/auth/login
 */
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
};

/**
 * 로그아웃 API
 * POST /api/auth/logout
 */
export const logout = async (refreshToken: string): Promise<LogoutResponse> => {
  const response = await axios.post<LogoutResponse>(
    `${API_URL}/api/auth/logout`,
    { refreshToken },
  );
  return response.data;
};

/**
 * 이메일 인증 코드 발송
 * POST /api/auth/email/verification
 */
export const sendVerificationEmail = async (
  email: string,
  purpose: 'SIGN_UP' | 'RESET_PASSWORD',
): Promise<SendEmailResponse> => {
  const response = await axios.post<SendEmailResponse>(
    `${API_URL}/api/auth/email/verification`,
    { email, purpose },
  );
  return response.data;
};

/**
 * 이메일 인증 코드 확인
 * POST /api/auth/email/verification/confirm
 */
export const verifyEmail = async (
  email: string,
  purpose: 'SIGN_UP' | 'RESET_PASSWORD',
  verificationCode: string,
): Promise<EmailVerificationResponse> => {
  const response = await axios.post<EmailVerificationResponse>(
    `${API_URL}/api/auth/email/verification/confirm`,
    { email, purpose, verificationCode },
  );
  return response.data;
};

/**
 * 회원가입
 * POST /api/auth/register
 * Authorization: Bearer {verificationToken} 필요
 */
export const register = async (
  verificationToken: string,
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>(
    `${API_URL}/api/auth/register`,
    data,
    {
      headers: {
        Authorization: `Bearer ${verificationToken}`,
      },
    },
  );
  return response.data;
};

/**
 * 닉네임 중복 확인
 * POST /api/auth/register/nickname/verify
 */
export const verifyNickname = async (
  nickname: string,
): Promise<NicknameVerificationResponse> => {
  const response = await axios.post<NicknameVerificationResponse>(
    `${API_URL}/api/auth/register/nickname/verify`,
    { nickname },
  );
  return response.data;
};

/**
 * 토큰 갱신
 * GET /api/auth/token?refreshToken=...
 */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await axios.get<RefreshTokenResponse>(
    `${API_URL}/api/auth/token`,
    {
      params: { refreshToken },
    },
  );
  return response.data;
};

/**
 * 비밀번호 확인
 * POST /api/auth/password/verify
 */
export const verifyPassword = async (
  password: string,
): Promise<VerifyPasswordResponse> => {
  const response = await axios.post<VerifyPasswordResponse>(
    `${API_URL}/api/auth/password/verify`,
    { password },
  );
  return response.data;
};

/**
 * 비밀번호 변경
 * PATCH /api/auth/password
 */
export const changePassword = async (
  password: string,
  confirmPassword: string,
): Promise<ChangePasswordResponse> => {
  const response = await axios.patch<ChangePasswordResponse>(
    `${API_URL}/api/auth/password`,
    { password, confirmPassword },
  );
  return response.data;
};

/**
 * 임시 비밀번호 발송 (비밀번호 찾기)
 * POST /api/auth/password/email
 * Authorization: Bearer {verificationToken} 필요
 */
export const sendTempPassword = async (
  verificationToken: string,
): Promise<{ sendSuccess: boolean; message?: string }> => {
  const response = await axios.post(
    `${API_URL}/api/auth/password/email`,
    {},
    {
      headers: {
        Authorization: `Bearer ${verificationToken}`,
      },
    },
  );
  return response.data;
};
