jest.mock('react-native-reanimated', () => {
  return {
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (toValue: any, config: any, cb: any) => {
      if (cb) cb(true);
      return toValue;
    },
    withSpring: (toValue: any, config: any, cb: any) => {
      if (cb) cb(true);
      return toValue;
    },
    cancelAnimation: () => {},
    runOnJS: (fn: any) => fn,
    interpolate: (value: number, inputRange: number[], outputRange: number[]) => value,
    Extrapolation: {
      CLAMP: 'clamp',
    },
    default: {
      call: () => {},
    },
  };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));
jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: (props: any) => React.createElement(View, props),
    default: (props: any) => React.createElement(View, props),
  };
});

import * as auth from '../src/features/auth';
import * as itinerary from '../src/features/itinerary';
import * as community from '../src/features/community';

describe('Features Scaffolding Exports', () => {
  it('should export features modules successfully', () => {
    expect(auth).toBeDefined();
    expect(itinerary).toBeDefined();
    expect(community).toBeDefined();
  });
});
