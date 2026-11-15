import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import InAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

const PLAY_STORE_APP_URL = 'market://details?id=com.planmate.planmate';
const PLAY_STORE_WEB_URL =
  'https://play.google.com/store/apps/details?id=com.planmate.planmate';

const openPlayStore = () =>
  Linking.openURL(PLAY_STORE_APP_URL).catch(() =>
    Linking.openURL(PLAY_STORE_WEB_URL).catch(() => undefined),
  );

/**
 * 앱을 켤 때 플레이 스토어에 새 버전이 있는지 보고, 있으면 업데이트를 강제한다.
 *
 * 즉시형(IMMEDIATE)이라 구글 플레이가 전체 화면으로 업데이트를 진행한다. 사용자가
 * 그 화면을 닫아도 `updateRequired`가 켜져 있어, 호출하는 쪽이 앱 위를 막는 안내를
 * 띄우고 `retry`로 다시 시작하게 한다. 새 버전이 있다는 판정은 플레이가 이미
 * 내리므로(AVAILABLE) 앱 버전과 비교하지 않는다. 라이브러리의 기본 비교는 플레이의
 * versionCode(숫자)를 versionName(2.1.0 같은 문자열)과 견주어 맞지 않는다.
 *
 * 확인에 실패하면(플레이 스토어 밖에서 설치했거나 연결이 없을 때) 막지 않는다.
 * 네트워크가 없다는 이유로 앱을 못 쓰게 하면 안 된다.
 */
export function useInAppUpdate() {
  const [updateRequired, setUpdateRequired] = useState(false);
  const updatesRef = useRef<InAppUpdates | null>(null);

  // 앱을 켜며 저절로 시작할 때는 실패해도 스토어로 넘기지 않는다. 안내 화면을 먼저
  // 보여 주고, 사용자가 단추를 눌렀을 때만 스토어로 보낸다.
  const startUpdate = useCallback(async (fromUser: boolean) => {
    const updates = updatesRef.current;
    if (!updates) {
      if (fromUser) await openPlayStore();
      return;
    }
    try {
      await updates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
    } catch {
      // 즉시 업데이트를 쓸 수 없는 기기나 상태다. 스토어 페이지로 보낸다.
      if (fromUser) await openPlayStore();
    }
  }, []);

  const retry = useCallback(() => startUpdate(true), [startUpdate]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    try {
      const updates = new InAppUpdates(false);
      updatesRef.current = updates;

      updates
        .checkNeedsUpdate({ customVersionComparator: () => 1 })
        .then(result => {
          if (cancelled || !result.shouldUpdate) return;
          setUpdateRequired(true);
          void startUpdate(false);
        })
        .catch(() => {
          // 확인하지 못했으면 막지 않는다.
        });
    } catch {
      // 네이티브 모듈을 쓸 수 없는 환경에서는 업데이트 확인만 건너뛴다.
    }

    return () => {
      cancelled = true;
    };
  }, [startUpdate]);

  return { updateRequired, retry };
}
