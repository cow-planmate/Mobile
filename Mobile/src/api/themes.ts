import axios from 'axios';
import { API_URL } from '@env';

// 선호 테마 VO (백엔드 PreferredThemeVO 기반)
export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  category: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT';
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
      '/api/user/preferredTheme',
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
    '/api/user/preferredTheme',
    { preferredThemeIds: themeIds },
  );
  return response.data;
};

const CATEGORY_ID_TO_ENUM: Record<number, 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT'> = {
  0: 'ATTRACTION',
  1: 'ACCOMMODATION',
  2: 'RESTAURANT',
};

/**
 * 선호 테마 카테고리별 변경 (내 일정)
 * PATCH /api/user/preferredThemes
 */
export const changePreferredThemes = async (
  categoryId: number,
  themeIds: number[],
): Promise<ChangePreferredThemesResponse> => {
  const categoryEnum = CATEGORY_ID_TO_ENUM[categoryId];
  if (!categoryEnum) {
    throw new Error(`Invalid categoryId: ${categoryId}`);
  }

  const response = await axios.patch<ChangePreferredThemesResponse>(
    '/api/user/preferredThemes',
    {
      themeUpdates: {
        [categoryEnum]: themeIds,
      },
    },
  );
  return response.data;
};
