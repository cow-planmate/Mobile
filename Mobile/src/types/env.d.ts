// '@env' 모듈 선언은 dotenv.d.ts로 분리되어 있다.
// (이 파일은 export를 포함하므로 앰비언트 모듈 선언을 담을 수 없다)

export interface SimplePlanVO {
  planId: string;
  planName: string;
  startDate?: string;
  endDate?: string;
}

export interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
  category: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT';
}
