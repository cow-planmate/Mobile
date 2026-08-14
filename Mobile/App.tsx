import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/useAuthStore';
import { AlertProvider } from './src/contexts/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { PlacesProvider } from './src/contexts/PlacesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';

// axios 인터셉터 설정 초기화
import './src/api/axiosConfig';

import { StyleSheet, StatusBar, AppState, AppStateStatus } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/common/toastConfig';

// 글로벌 폰트 스케일링 가드는 index.js에서 최우선 적용된다.
// (React 19에서 defaultProps가 제거되어 utils/fontScalingGuard로 대체)

const SHOW_STORYBOOK = process.env.NODE_ENV !== 'test' && false;

/**
 * 토스트 스타일.
 *
 * 예전에는 거의 검은 유리 카드 + 그림자 + iOS 다크모드 시스템 색
 * (#FF453A/#30D158/#0A84FF)을 그대로 썼다. 이 앱은 라이트 테마 고정이고
 * 그림자를 쓰지 않는 시스템이라(DESIGN.md The Flat Rule), 화면 전체가
 * 흰 종이인데 토스트만 검은 유리로 떠서 유일하게 이질적이었다.
 * 종이 배경 + 1dp 경계선 + 토큰 색으로 시스템에 맞춘다.
 */
/* Toast visuals are shared with Storybook through toastConfig. */

/* ── Toast Config ── */
function App() {
  const initializeAuth = useAuthStore(state => state.initialize);

  React.useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  React.useEffect(() => {
    // react-query는 웹의 window focus/blur로 포커스를 판단하는데 RN에는 없다.
    // AppState로 대체해, 백그라운드에서 돌아왔을 때 stale 쿼리를 자동 재조회한다.
    const handleAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  if (SHOW_STORYBOOK) {
    // Storybook 런타임(+ 모든 *.stories 모듈)이 앱 콜드 스타트에 실행되지 않도록
    // 정적 import 대신 지연 로드한다.
    const StorybookUIRoot = require('./.rnstorybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <PlacesProvider>
            <WebSocketProvider>
              <ItineraryProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
                <Toast config={toastConfig} />
              </ItineraryProvider>
            </WebSocketProvider>
          </PlacesProvider>
        </AlertProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
