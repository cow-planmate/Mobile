import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/useAuthStore';
import { AlertProvider } from './src/contexts/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { PlacesProvider } from './src/contexts/PlacesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';

import './src/api/axiosConfig';

import { StyleSheet, StatusBar, AppState, AppStateStatus } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/common/toastConfig';

const SHOW_STORYBOOK = process.env.NODE_ENV !== 'test' && false;

function App() {
  const initializeAuth = useAuthStore(state => state.initialize);

  React.useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  React.useEffect(() => {
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
    const StorybookUIRoot = require('./.rnstorybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/*
        targetSdk 36부터 안드로이드가 edge-to-edge를 강제해 backgroundColor와
        translucent는 무시된다. 화면이 상태바 아래로 깔리므로 여백은 각
        화면이 useScreenInsets로 직접 얹는다.
      */}
      <StatusBar barStyle="dark-content" />
      {/*
        initialMetrics를 주지 않으면 네이티브가 값을 알려줄 때까지 아무것도
        그리지 않아 첫 화면이 빈 채로 남는다.
      */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
