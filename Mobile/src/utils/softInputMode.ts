import { NativeModules, Platform } from 'react-native';

const { SoftInputMode } = NativeModules;

/**
 * 매니페스트의 windowSoftInputMode="adjustResize"를 특정 화면이 포커스된 동안만
 * 되돌린다. react-native-screens의 네이티브 스크린 컨테이너가 이 값에 따라
 * 리사이즈되므로, 키보드가 떠도 레이아웃이 움직이면 안 되는 화면(회원가입 등)에서
 * 포커스 시 setAdjustNothing, 블러 시 setAdjustResize를 짝지어 호출한다.
 */
export const setAdjustNothing = () => {
  if (Platform.OS === 'android') SoftInputMode?.setAdjustNothing();
};

export const setAdjustResize = () => {
  if (Platform.OS === 'android') SoftInputMode?.setAdjustResize();
};
