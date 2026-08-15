import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Header from '../src/components/common/Header';

// Mock react-navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock useAuthStore zustand store
jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({
    logout: jest.fn(),
  }),
}));

// 로그아웃 시 소켓을 끊는다. 실제 컨텍스트는 AsyncStorage·STOMP까지 끌고 온다.
jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({ disconnect: jest.fn() }),
}));

// Mock gravatarUrl
jest.mock('../src/utils/gravatarUrl', () => () => 'mock-avatar-url');

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-native-fontawesome', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FontAwesomeIcon: () => React.createElement(View),
  };
});

// Mock Lucide icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    User: () => React.createElement(View),
    Users: () => React.createElement(View),
    LogOut: () => React.createElement(View),
  };
});

describe('Header Component', () => {
  it('renders correctly with nickname', async () => {
    let component: any;
    await act(async () => {
      component = renderer.create(
        <Header
          nickname="홍길동"
          email="test@test.com"
          onNotificationPress={jest.fn()}
          onNavigateProfile={jest.fn()}
        />
      );
    });
    expect(component.toJSON()).toBeDefined();
  });
});
