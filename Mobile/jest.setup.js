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
