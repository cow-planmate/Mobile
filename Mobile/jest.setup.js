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
