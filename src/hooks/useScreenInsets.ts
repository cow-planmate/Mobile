import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 화면이 상태바·제스처 바를 피하도록 바깥쪽에 얹을 여백.
 *
 * targetSdk 36부터 안드로이드가 edge-to-edge를 강제해 StatusBar의
 * translucent={false}가 무시된다. 상단바를 스스로 그리는 화면은 모두 이 값을
 * 얹어야 글자가 상태바 아래로 깔리지 않는다.
 *
 * @param withBottom 탭 바 위에 놓이는 화면은 아래쪽을 탭 바가 이미 피하므로 false를 준다.
 */
export const useScreenInsets = (withBottom = true) => {
  const insets = useSafeAreaInsets();
  return useMemo(
    () => ({
      paddingTop: insets.top,
      paddingBottom: withBottom ? insets.bottom : 0,
    }),
    [insets.top, insets.bottom, withBottom],
  );
};
