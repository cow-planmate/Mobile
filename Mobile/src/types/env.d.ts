declare module '@env' {
  export const API_URL: string;
}

export interface SimplePlanVO {
  planId: number;
  planName: string;
  startDate?: string;
  endDate?: string;
}
