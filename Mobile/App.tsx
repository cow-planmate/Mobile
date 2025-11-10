// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 1. import 추가

function App() {
  return (
    // 2. 최상위 뷰를 GestureHandlerRootView로 감싸줍니다.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ItineraryProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ItineraryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
