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
