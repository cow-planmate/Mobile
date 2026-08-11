// 네이티브 인셋 계산이 없는 테스트 환경이므로 0으로 고정한다.
// 패키지가 제공하는 jest/mock.tsx는 트랜스파일 대상 밖(node_modules)이라 그대로
// require하면 import 구문에서 깨진다. 필요한 API만 직접 흉내낸다.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 0, height: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children, ...props }) =>
      React.createElement('RNCSafeAreaView', props, children),
    SafeAreaInsetsContext: React.createContext(inset),
    SafeAreaFrameContext: React.createContext(frame),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets: inset, frame },
  };
});

// .env는 저장소에 포함되지 않으므로 테스트에서는 고정값을 사용한다.
jest.mock('@env', () => ({
  API_URL: 'http://localhost:8080',
  KAKAO_APP_KEY: 'test-kakao-app-key',
  WEB_URL: 'http://localhost:3000',
}), { virtual: true });

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
  hasString: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
  default: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return class LinearGradient extends React.Component {
    render() {
      return <View {...this.props}>{this.props.children}</View>;
    }
  };
});

// 이 패키지는 소스를 그대로 배포해 트랜스파일되지 않은 import 구문이 들어 있다.
// transformIgnorePatterns를 넓히는 대신 linear-gradient와 같은 방식으로 대체한다.
jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return class DatePicker extends React.Component {
    render() {
      return <View {...this.props} />;
    }
  };
});

// 네이티브 모듈이라 테스트 환경에는 없다. 패키지가 제공하는 CJS 목을 그대로 쓴다.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);
