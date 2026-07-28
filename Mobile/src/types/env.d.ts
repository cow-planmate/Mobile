declare module '@env' {
  export const API_URL: string;
  export const KAKAO_APP_KEY: string;
}

export interface SimplePlanVO {
  planId: string;
  planName: string;
  startDate?: string;
  endDate?: string;
}

export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  preferredThemeCategoryId: number;
  preferredThemeCategoryName: string;
}
