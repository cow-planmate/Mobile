/**
 * react-native-dotenv(@env) 앰비언트 모듈 선언.
 *
 * 이 파일은 top-level export가 없어야 전역 앰비언트 선언으로 인식된다.
 * (export가 있으면 모듈 증강으로 취급되어 `Cannot find module '@env'` 오류가 발생한다)
 */
declare module '@env' {
  export const API_URL: string;
  export const KAKAO_APP_KEY: string;
  export const WEB_URL: string;
}
