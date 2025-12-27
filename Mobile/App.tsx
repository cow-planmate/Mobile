import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
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
