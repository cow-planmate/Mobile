// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext'; // ⭐️ 1. 새로 추가

function App() {
  return (
    <AuthProvider>
      {/* ⭐️ 2. ItineraryProvider로 감싸줍니다. */}
      <ItineraryProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ItineraryProvider>
    </AuthProvider>
  );
}

export default App;
