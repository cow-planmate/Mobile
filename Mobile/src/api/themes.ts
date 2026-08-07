import axios from 'axios';

// 선호 테마 VO (백엔드 PreferredThemeVO 기반)
export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  category: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT';
}

// 전체 테마 목록 조회 응답 (PreferredThemeListResponse)
export interface GetPreferredThemeResponse {
  preferredThemes: PreferredThemeVO[];
}

// 테마 저장 요청 (회원가입 후)
export interface SavePreferredThemeRequest {
  preferredThemeIds: number[];
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

/** 앱이 쓰는 카테고리 ID → 서버 PreferredThemeCategory */
const CATEGORY_ID_TO_ENUM: Record<
  number,
  'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT'
> = {
  0: 'ATTRACTION',
  1: 'ACCOMMODATION',
  2: 'RESTAURANT',
};

/**
 * 선호 테마 초기 저장 (회원가입 후)
 * POST /api/user/preferredTheme — 204 No Content
 *
 * 서버가 빈 목록을 거부하므로(@NotEmpty) 호출부에서 걸러 보내야 한다.
 */
export const savePreferredThemes = async (
  themeIds: number[],
): Promise<void> => {
  await axios.post('/api/user/preferredTheme', {
    preferredThemeIds: themeIds,
  });
};

/**
 * 선호 테마 변경
 * PATCH /api/user/preferredThemes — 204 No Content
 *
 * 서버는 themeUpdates에 담긴 카테고리만 비우고 다시 채우며, 이를 한 트랜잭션에서
 * 처리한다. 카테고리마다 따로 호출하면 중간에 실패했을 때 일부만 반영된 채로
 * 남으므로 바꿀 카테고리를 한 번에 담아 보낸다.
 * 빈 배열은 "그 카테고리를 비운다"는 뜻이라 그대로 보내야 한다.
 *
 * @param themeIdsByCategoryId 카테고리 ID(0 관광지 / 1 숙소 / 2 식당) → 테마 ID 목록
 */
export const changePreferredThemes = async (
  themeIdsByCategoryId: Record<number, number[]>,
): Promise<void> => {
  const themeUpdates: Record<string, number[]> = {};

  for (const [rawCategoryId, themeIds] of Object.entries(
    themeIdsByCategoryId,
  )) {
    const categoryEnum = CATEGORY_ID_TO_ENUM[Number(rawCategoryId)];
    if (!categoryEnum) {
      throw new Error(`Invalid categoryId: ${rawCategoryId}`);
    }
    themeUpdates[categoryEnum] = themeIds;
  }

  // 서버가 빈 맵을 거부한다(@NotEmpty).
  if (Object.keys(themeUpdates).length === 0) {
    return;
  }

  await axios.patch('/api/user/preferredThemes', { themeUpdates });
};
