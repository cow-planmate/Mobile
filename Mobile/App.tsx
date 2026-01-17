import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StorybookUIRoot from './.storybook';

// axios 인터셉터 설정 초기화
import './src/api/axiosConfig';

import { StyleSheet } from 'react-native';

const SHOW_STORYBOOK = true;

function App() {
  if (SHOW_STORYBOOK) {
      // getStorybookUI()의 결과는 컴포넌트입니다.
    return <StorybookUIRoot />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <WebSocketProvider>
          <ItineraryProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ItineraryProvider>
        </WebSocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
