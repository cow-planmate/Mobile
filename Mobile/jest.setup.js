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

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return class DatePicker extends React.Component {
    render() {
      return <View {...this.props} />;
    }
  };
});

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);

jest.mock('@react-native-cookies/cookies', () => ({
  clearAll: jest.fn(() => Promise.resolve(true)),
  getAll: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve(true)),
  clearByName: jest.fn(() => Promise.resolve(true)),
  flush: jest.fn(() => Promise.resolve()),
}));


// tentap 편집기는 WebView 위에서 도는 웹 번들이라 jest 환경에서는 그대로 뜨지 않는다.
// 편집기 속을 보는 테스트는 없고, HTML↔블록 변환은 richText 테스트가 따로 본다.
jest.mock('@10play/tentap-editor', () => ({
  Images: {},
  TenTapStartKit: [],
  PlaceholderBridge: { configureExtension: jest.fn(() => ({})) },
  RichText: () => null,
  Toolbar: () => null,
  useEditorBridge: () => ({
    setPlaceholder: jest.fn(),
    getHTML: jest.fn(() => Promise.resolve('')),
  }),
  useEditorContent: () => undefined,
}));
