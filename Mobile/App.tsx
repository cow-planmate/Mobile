import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// axios 인터셉터 설정 초기화
import './src/api/axiosConfig';

import { StyleSheet } from 'react-native';

function App() {
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
