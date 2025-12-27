import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StyleSheet } from 'react-native';

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
