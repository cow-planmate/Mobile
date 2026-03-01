import axios from 'axios';
import { API_URL } from '@env';

// 선호 테마 VO (백엔드 PreferredThemeVO 기반)
export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  preferredThemeCategoryId: number;
  preferredThemeCategoryName: string;
}

// 전체 테마 목록 조회 응답
export interface GetPreferredThemeResponse {
  message: string;
  preferredThemes: PreferredThemeVO[];
}

// 테마 저장 요청 (회원가입 후)
export interface SavePreferredThemeRequest {
  preferredThemeIds: number[];
}

// 테마 저장 응답
export interface SavePreferredThemeResponse {
  message: string;
}

// 테마 변경 요청 (카테고리별)
export interface ChangePreferredThemesRequest {
  preferredThemeCategoryId: number;
  preferredThemeIds: number[];
}

// 테마 변경 응답
export interface ChangePreferredThemesResponse {
  message: string;
}

/**
 * 전체 선호 테마 목록 조회 (카테고리별 30개)
 * GET /api/user/preferredTheme
 */
export const getPreferredThemes =
  async (): Promise<GetPreferredThemeResponse> => {
    const response = await axios.get<GetPreferredThemeResponse>(
      `${API_URL}/api/user/preferredTheme`,
    );
    return response.data;
  };

/**
 * 선호 테마 초기 저장 (회원가입 후)
 * POST /api/user/preferredTheme
 */
export const savePreferredThemes = async (
  themeIds: number[],
): Promise<SavePreferredThemeResponse> => {
  const response = await axios.post<SavePreferredThemeResponse>(
    `${API_URL}/api/user/preferredTheme`,
    { preferredThemeIds: themeIds },
  );
  return response.data;
};

/**
 * 선호 테마 카테고리별 변경 (마이페이지)
 * PATCH /api/user/preferredThemes
 */
export const changePreferredThemes = async (
  categoryId: number,
  themeIds: number[],
): Promise<ChangePreferredThemesResponse> => {
  const response = await axios.patch<ChangePreferredThemesResponse>(
    `${API_URL}/api/user/preferredThemes`,
    { preferredThemeCategoryId: categoryId, preferredThemeIds: themeIds },
  );
  return response.data;
};
