import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertProvider } from '../src/contexts/AlertContext';
import { PlacesProvider } from '../src/contexts/PlacesContext';
import type { Preview } from '@storybook/react-native';

const preview: Preview = {
  decorators: [
    Story => (
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AlertProvider>
            <PlacesProvider>
              <Story />
            </PlacesProvider>
          </AlertProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
