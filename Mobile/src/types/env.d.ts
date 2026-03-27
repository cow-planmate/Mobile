declare module '@env' {
  export const API_URL: string;
  export const INVITATION_SSE_URL: string | undefined;
  export const FCM_TOKEN_REGISTER_URL: string | undefined;
  export const INVITATION_PUSH_TYPES: string | undefined;
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
