import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    NavigationContainer: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: any) => {
      const state = {
        user: null,
        needsThemeSelection: false,
        setNeedsThemeSelection: jest.fn(),
        initialize: jest.fn(),
      };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({
        initialize: jest.fn(),
      }),
    }
  )
}));

jest.mock('../src/contexts/AlertContext', () => {
  const React = require('react');

  return {
    AlertProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('../src/contexts/WebSocketContext', () => {
  const React = require('react');

  return {
    WebSocketProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('../src/contexts/PlacesContext', () => {
  const React = require('react');

  return {
    PlacesProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('../src/contexts/ItineraryContext', () => {
  const React = require('react');

  return {
    ItineraryProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockAppNavigator() {
    return React.createElement(
      Text,
      { testID: 'app-navigator' },
      'app-navigator',
    );
  };
});

jest.mock('../.rnstorybook', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockStorybookUIRoot() {
    return React.createElement(
      Text,
      { testID: 'storybook-root' },
      'storybook-root',
    );
  };
});

jest.mock('../src/api/axiosConfig', () => ({}));

jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const { View } = require('react-native');

  return function MockToast() {
    return React.createElement(View, { testID: 'toast-root' });
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    XCircle: (props: object) => React.createElement(View, props),
  };
});

import App from '../App';

test('renders the app shell', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(renderer).toBeDefined();
  expect(renderer?.root.findByProps({ testID: 'app-navigator' })).toBeTruthy();
  expect(renderer?.root.findByProps({ testID: 'toast-root' })).toBeTruthy();
});
