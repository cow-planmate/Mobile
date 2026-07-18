import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/useAuthStore';
import { AlertProvider } from './src/contexts/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { PlacesProvider } from './src/contexts/PlacesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import StorybookUIRoot from './.storybook';

// axios 인터셉터 설정 초기화
import './src/api/axiosConfig';

import { StyleSheet, StatusBar, View, Text, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';
import { XCircle, CheckCircle2, Info } from 'lucide-react-native';

// 글로벌 폰트 스케일링 가드 적용 (레이아웃 깨짐 원천 방지)
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.allowFontScaling = false;

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.allowFontScaling = false;

const SHOW_STORYBOOK = process.env.NODE_ENV !== 'test' && true;

/* ── Toast Styles ── */
const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: 'rgba(28, 28, 30, 0.90)', // Glassmorphism dark base
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Subtle border
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'left',
    marginLeft: 8,
    flexShrink: 1,
    lineHeight: 18,
  },
  successText: {
    color: '#FFFFFF',
  },
  infoText: {
    color: '#FFFFFF',
  },
});

/* ── Toast Config ── */
const toastConfig: ToastConfig = {
  error: ({ text1 }) => (
    <View style={toastStyles.container}>
      <XCircle size={18} color="#FF453A" strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  success: ({ text1 }) => (
    <View style={toastStyles.container}>
      <CheckCircle2 size={18} color="#30D158" strokeWidth={2.5} />
      <Text style={[toastStyles.text, toastStyles.successText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Info size={18} color="#0A84FF" strokeWidth={2.5} />
      <Text style={[toastStyles.text, toastStyles.infoText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
};

function App() {
  const initializeAuth = useAuthStore(state => state.initialize);

  React.useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (SHOW_STORYBOOK) {
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
