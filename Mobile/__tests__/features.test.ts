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
import * as places from '../src/features/places';

describe('Features Scaffolding Exports', () => {
  it('should export features modules successfully', () => {
    expect(auth).toBeDefined();
    expect(itinerary).toBeDefined();
    expect(community).toBeDefined();
    expect(places).toBeDefined();
  });
});
