import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { PlacesProvider } from './src/contexts/PlacesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StorybookUIRoot from './.storybook';

// axios 인터셉터 설정 초기화
import './src/api/axiosConfig';

import { StyleSheet, StatusBar, View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';
import { XCircle } from 'lucide-react-native';

const SHOW_STORYBOOK = true;

/* ── Toast Styles ── */
const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 36,
    marginTop: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
    flexShrink: 1,
    lineHeight: 20,
  },
  successText: {
    marginLeft: 0,
    color: '#30D158',
  },
  infoText: {
    marginLeft: 0,
    color: '#BFBFBF',
  },
});

/* ── Toast Config ── */
const toastConfig: ToastConfig = {
  error: ({ text1 }) => (
    <View style={toastStyles.container}>
      <XCircle size={20} color="#FF453A" strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  success: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Text style={[toastStyles.text, toastStyles.successText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Text style={[toastStyles.text, toastStyles.infoText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
};

function App() {
  if (SHOW_STORYBOOK) {
    // getStorybookUI()의 결과는 컴포넌트입니다.
    return <StorybookUIRoot />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <AlertProvider>
          <WebSocketProvider>
            <PlacesProvider>
              <ItineraryProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
                <Toast config={toastConfig} />
              </ItineraryProvider>
            </PlacesProvider>
          </WebSocketProvider>
        </AlertProvider>
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
