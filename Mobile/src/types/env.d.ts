declare module '@env' {
  export const API_URL: string;
}

export interface SimplePlanVO {
  planId: number;
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
