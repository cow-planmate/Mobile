import axios from 'axios';

export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  category: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT';
}

export interface GetPreferredThemeResponse {
  preferredThemes: PreferredThemeVO[];
}

export interface SavePreferredThemeRequest {
  preferredThemeIds: number[];
}

export const getPreferredThemes =
  async (signal?: AbortSignal): Promise<GetPreferredThemeResponse> => {
    const response = await axios.get<GetPreferredThemeResponse>(
      '/api/user/preferredTheme',
      { signal },
    );
    return response.data;
  };

const CATEGORY_ID_TO_ENUM: Record<
  number,
  'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT'
> = {
  0: 'ATTRACTION',
  1: 'ACCOMMODATION',
  2: 'RESTAURANT',
};

export const savePreferredThemes = async (
  themeIds: number[],
): Promise<void> => {
  await axios.post('/api/user/preferredTheme', {
    preferredThemeIds: themeIds,
  });
};

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

  if (Object.keys(themeUpdates).length === 0) {
    return;
  }

  await axios.patch('/api/user/preferredThemes', { themeUpdates });
};
