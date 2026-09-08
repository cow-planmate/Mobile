import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Header from '../src/components/common/Header';
import { Modal, StyleSheet } from 'react-native';
import { normalize } from '../src/utils/normalize';

const mockLogout = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      logout: mockLogout,
    }),
}));

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({ disconnect: mockDisconnect }),
}));

jest.mock('../src/utils/gravatarUrl', () => () => 'mock-avatar-url');

jest.mock('@fortawesome/react-native-fontawesome', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FontAwesomeIcon: () => React.createElement(View),
  };
});

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
  it.each(['마이페이지', '로그아웃', '프로필 메뉴 닫기'])(
    '%s 선택 시 메뉴를 닫고 해당 동작만 실행한다',
    async label => {
      jest.useFakeTimers();
      jest.clearAllMocks();
      const onNavigateProfile = jest.fn();
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <Header
            nickname="홍길동"
            email="test@test.com"
            onNotificationPress={jest.fn()}
            onNavigateProfile={onNavigateProfile}
          />,
        );
      });
      try {
        tree!.root
          .findAll(node => jest.isMockFunction(node.instance?.measureInWindow))
          .forEach(node => {
            node.instance.measureInWindow = jest.fn(
              (callback: (...values: number[]) => void) =>
                callback(300, 40, 28, 28),
            );
          });
        act(() =>
          tree!.root
            .findByProps({ accessibilityLabel: '홍길동님 메뉴 열기' })
            .props.onPress(),
        );
        expect(tree!.root.findByType(Modal).props.visible).toBe(true);
        tree!.root
          .findAll(
            node =>
              node.props.testID === 'profile-menu-overlay' &&
              jest.isMockFunction(node.instance?.measureInWindow),
          )
          .forEach(node => {
            node.instance.measureInWindow = jest.fn(
              (callback: (...values: number[]) => void) =>
                callback(0, 24, 360, 720),
            );
          });
        act(() => tree!.root.findByType(Modal).props.onShow());
        const menuStyle = StyleSheet.flatten(
          tree!.root.findByProps({ testID: 'profile-menu' }).props.style,
        );
        expect(menuStyle.top).toBe(40 - 24 + 28 + normalize(6));
        expect(menuStyle.right).toBe(Math.max(normalize(16), 32));
        expect(
          tree!.root.findAllByProps({ children: 'test@test.com' }).length,
        ).toBeGreaterThan(0);
        act(() =>
          tree!.root.findByProps({ accessibilityLabel: label }).props.onPress(),
        );
        expect(tree!.root.findByType(Modal).props.visible).toBe(false);
        act(() => jest.runAllTimers());
        expect(onNavigateProfile).toHaveBeenCalledTimes(
          label === '마이페이지' ? 1 : 0,
        );
        expect(mockLogout).toHaveBeenCalledTimes(label === '로그아웃' ? 1 : 0);
        expect(mockDisconnect).toHaveBeenCalledTimes(
          label === '로그아웃' ? 1 : 0,
        );
      } finally {
        act(() => tree!.unmount());
        jest.useRealTimers();
      }
    },
  );

  it('renders correctly with nickname', async () => {
    let component: any;
    await act(async () => {
      component = renderer.create(
        <Header
          nickname="홍길동"
          email="test@test.com"
          onNotificationPress={jest.fn()}
          onNavigateProfile={jest.fn()}
        />,
      );
    });
    expect(component.toJSON()).toBeDefined();
  });
});
