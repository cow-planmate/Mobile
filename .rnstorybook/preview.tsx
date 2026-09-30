import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AlertProvider } from '../src/contexts/AlertContext';
import { PlacesProvider } from '../src/contexts/PlacesContext';
import { toastConfig } from '../src/components/common/toastConfig';
import type { Preview } from '@storybook/react-native';

// 화면 스토리는 서버 상태 훅을 그대로 타므로 프로바이더가 필요하다.
// 스토리에서는 네트워크를 재시도하지 않고 실패 상태를 그대로 보여준다.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});

const preview: Preview = {
  decorators: [
    Story => (
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <AlertProvider>
              <PlacesProvider>
                <Story />
                {/* 화면에서 띄우는 토스트가 스토리북에서도 보이도록 호스트를 함께 둔다 */}
                <Toast config={toastConfig} />
              </PlacesProvider>
            </AlertProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
