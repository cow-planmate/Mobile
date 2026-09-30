import { Platform, Vibration } from 'react-native';

/**
 * 무언가를 집었을 때의 짧은 진동 한 번.
 *
 * iOS의 Vibration.vibrate는 길이를 고를 수 없어 400ms를 통째로 울린다.
 * 집는 신호로 쓰기엔 과해서 안드로이드에서만 울린다. iOS까지 주려면
 * react-native-haptic-feedback을 넣고 이 함수 하나만 바꾸면 된다.
 */
export const hapticTick = () => {
  if (Platform.OS !== 'android') return;
  // VIBRATE 권한이 없는 빌드에서 던지는 예외가 화면을 덮지 않게 한다.
  // 진동은 있으면 좋은 신호이지 없으면 동작이 막히는 것이 아니다.
  try {
    Vibration.vibrate(12);
  } catch {}
};
