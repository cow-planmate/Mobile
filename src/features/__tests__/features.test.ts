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
    // AirplaneLoading이 모듈을 불러올 때 Easing을 바로 부른다.
    Easing: {
      linear: (value: number) => value,
      sin: (value: number) => value,
      inOut: () => (value: number) => value,
      bezier: () => ({ factory: () => (value: number) => value }),
    },
    interpolate: (value: number, inputRange: number[], outputRange: number[]) => value,
    Extrapolation: {
      CLAMP: 'clamp',
    },
    createAnimatedComponent: (Component: any) => Component,
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
jest.mock('@shopify/flash-list', () => ({
  FlashList: () => null,
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: (props: any) => React.createElement(View, props),
    default: (props: any) => React.createElement(View, props),
  };
});

import * as auth from '../auth';
import * as itinerary from '../itinerary';
import * as community from '../community';

describe('Features Scaffolding Exports', () => {
  it('should export features modules successfully', () => {
    expect(auth).toBeDefined();
    expect(itinerary).toBeDefined();
    expect(community).toBeDefined();
  });
});
