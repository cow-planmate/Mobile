import { useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const EXIT_CONFIRM_WINDOW_MS = 2000;

/**
 * 뒤로가기로 앱이 종료되기 전에 한 번 더 확인받는다.
 *
 * 첫 백은 소비하고 안내만 띄운 뒤(return true), 창이 열려 있는 동안 들어온
 * 두 번째 백은 흘려보내 RN 기본 동작인 종료로 넘긴다(return false).
 * 화면이 blur되면 무장 상태를 되돌려 다음 진입 때 다시 처음부터 확인한다.
 */
export function useDoublePressExit(enabled = true) {
  const exitArmedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      let disarmTimer: ReturnType<typeof setTimeout> | null = null;

      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (exitArmedRef.current) {
          return false;
        }

        exitArmedRef.current = true;
        Toast.show({
          type: 'info',
          text1: '한 번 더 누르면 종료돼요',
          position: 'top',
          visibilityTime: EXIT_CONFIRM_WINDOW_MS,
        });

        disarmTimer = setTimeout(() => {
          exitArmedRef.current = false;
        }, EXIT_CONFIRM_WINDOW_MS);

        return true;
      });

      return () => {
        sub.remove();
        if (disarmTimer) clearTimeout(disarmTimer);
        exitArmedRef.current = false;
      };
    }, [enabled]),
  );
}
