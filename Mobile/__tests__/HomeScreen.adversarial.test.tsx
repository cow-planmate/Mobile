import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TouchableOpacity, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: ({ children }: any) => React.createElement(View, null, children),
    useSafeAreaInsets: () => inset,
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const FastImage: any = (props: any) => React.createElement(View, props);
  FastImage.resizeMode = { cover: 'cover', contain: 'contain', stretch: 'stretch', center: 'center' };
  FastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
  return FastImage;
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

import { HomeScreenView, HomeScreenViewProps } from '../src/features/home/screens/HomeScreen.view';

describe('Adversarial & Contract Stress Test: HomeScreenView Variants', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithQuery = (props: HomeScreenViewProps) => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreenView {...props} />
        </QueryClientProvider>
      );
    });
    return renderer!;
  };

  const baseProps: HomeScreenViewProps = {
    nickname: '테스터',
    email: 'tester@planmate.app',
    pendingRequestsCount: 0,
    destination: '제주도',
    dateText: '2026.09.12 - 2026.09.14',
    paxText: '성인 2명',
    isFormValid: true,
    isSearchModalVisible: false,
    isCalendarVisible: false,
    isPaxModalVisible: false,
    isNotificationModalVisible: false,
    pendingRequestList: [],
    onCloseNotificationModal: jest.fn(),
    onAcceptNotification: jest.fn(),
    onRejectNotification: jest.fn(),
    onNotificationPress: jest.fn(),
    onNavigateProfile: jest.fn(),
    onOpenSearchModal: jest.fn(),
    onCloseSearchModal: jest.fn(),
    onSelectLocation: jest.fn(),
    onOpenCalendar: jest.fn(),
    onCloseCalendar: jest.fn(),
    onConfirmCalendar: jest.fn(),
    onOpenPaxModal: jest.fn(),
    onClosePaxModal: jest.fn(),
    onConfirmPax: jest.fn(),
    onCreateItinerary: jest.fn(),
    isCreating: false,
  };

  const variants: Array<HomeScreenViewProps['variant']> = [
    undefined, // Default (Option 2)
    'option1',
    'option2',
    'option3',
    'option4',
  ];

  variants.forEach(variant => {
    const variantName = variant ?? 'default (option2)';

    describe(`Variant: ${variantName}`, () => {
      it('fires onOpenSearchModal when search row/chip is pressed', () => {
        const onOpenSearchModal = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          onOpenSearchModal,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const searchTouchable = touchables.find(t => {
          const label = t.props.accessibilityLabel;
          return label && label.includes('여행지');
        });

        expect(searchTouchable).toBeDefined();
        expect(searchTouchable!.props.accessibilityRole).toBe('button');
        ReactTestRenderer.act(() => {
          searchTouchable!.props.onPress();
        });
        expect(onOpenSearchModal).toHaveBeenCalledTimes(1);
      });

      it('fires onOpenCalendar when calendar row/chip is pressed', () => {
        const onOpenCalendar = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          onOpenCalendar,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const calendarTouchable = touchables.find(t => {
          const label = t.props.accessibilityLabel;
          return label && label.includes('기간');
        });

        expect(calendarTouchable).toBeDefined();
        expect(calendarTouchable!.props.accessibilityRole).toBe('button');
        ReactTestRenderer.act(() => {
          calendarTouchable!.props.onPress();
        });
        expect(onOpenCalendar).toHaveBeenCalledTimes(1);
      });

      it('fires onOpenPaxModal when pax row/chip is pressed', () => {
        const onOpenPaxModal = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          onOpenPaxModal,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const paxTouchable = touchables.find(t => {
          const label = t.props.accessibilityLabel;
          return label && label.includes('인원수');
        });

        expect(paxTouchable).toBeDefined();
        expect(paxTouchable!.props.accessibilityRole).toBe('button');
        ReactTestRenderer.act(() => {
          paxTouchable!.props.onPress();
        });
        expect(onOpenPaxModal).toHaveBeenCalledTimes(1);
      });

      it('fires onCreateItinerary when valid and submit button is pressed', () => {
        const onCreateItinerary = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          isFormValid: true,
          isCreating: false,
          onCreateItinerary,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const submitBtn = touchables.find(t => t.props.accessibilityLabel === '일정생성');

        expect(submitBtn).toBeDefined();
        expect(submitBtn!.props.accessibilityRole).toBe('button');
        expect(submitBtn!.props.disabled).toBe(false);
        expect(submitBtn!.props.accessibilityState).toEqual({ disabled: false });
        expect(submitBtn!.props.activeOpacity).toBe(0.8);

        ReactTestRenderer.act(() => {
          submitBtn!.props.onPress();
        });
        expect(onCreateItinerary).toHaveBeenCalledTimes(1);
      });

      it('disables submit button and sets accessibilityState when isFormValid is false', () => {
        const onCreateItinerary = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          isFormValid: false,
          isCreating: false,
          onCreateItinerary,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const submitBtn = touchables.find(t => t.props.accessibilityLabel === '일정생성');

        expect(submitBtn).toBeDefined();
        expect(submitBtn!.props.disabled).toBe(true);
        expect(submitBtn!.props.accessibilityState).toEqual({ disabled: true });
      });

      it('disables submit button and displays loading text when isCreating is true', () => {
        const onCreateItinerary = jest.fn();
        const renderer = renderWithQuery({
          ...baseProps,
          variant,
          isFormValid: true,
          isCreating: true,
          onCreateItinerary,
        });

        const touchables = renderer.root.findAllByType(TouchableOpacity);
        const submitBtn = touchables.find(t => t.props.accessibilityLabel === '일정생성');

        expect(submitBtn).toBeDefined();
        expect(submitBtn!.props.disabled).toBe(true);
        expect(submitBtn!.props.accessibilityState).toEqual({ disabled: true });

        const texts = submitBtn!.findAllByType(Text);
        const hasCreatingText = texts.some(t => t.props.children === '일정 만드는 중…');
        expect(hasCreatingText).toBe(true);
      });
    });
  });

  describe('Adversarial Boundary & Robustness Cases', () => {
    it('renders placeholder labels properly when fields are empty', () => {
      const renderer = renderWithQuery({
        ...baseProps,
        destination: '',
        dateText: '',
        paxText: '',
        variant: 'option2',
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const searchTouchable = touchables.find(t => t.props.accessibilityLabel === '여행지, 여행지 선택');
      const calendarTouchable = touchables.find(t => t.props.accessibilityLabel === '기간, 날짜 선택');
      const paxTouchable = touchables.find(t => t.props.accessibilityLabel === '인원수, 인원 선택');

      expect(searchTouchable).toBeDefined();
      expect(calendarTouchable).toBeDefined();
      expect(paxTouchable).toBeDefined();
    });

    it('handles Korean, emojis, and special characters safely', () => {
      const complexDest = '🗼 도쿄 & 파리 (프랑스) 100% ✨';
      const complexDate = '2026.10.01(목) ~ 2026.10.05(월)';
      const complexPax = '성인 3명, 아동 2명 (반려동물 동반 🐕)';

      const renderer = renderWithQuery({
        ...baseProps,
        destination: complexDest,
        dateText: complexDate,
        paxText: complexPax,
        variant: 'option1',
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const searchTouchable = touchables.find(t => t.props.accessibilityLabel === `여행지, ${complexDest}`);
      const calendarTouchable = touchables.find(t => t.props.accessibilityLabel === `기간, ${complexDate}`);
      const paxTouchable = touchables.find(t => t.props.accessibilityLabel === `인원수, ${complexPax}`);

      expect(searchTouchable).toBeDefined();
      expect(calendarTouchable).toBeDefined();
      expect(paxTouchable).toBeDefined();
    });

    it('handles extremely long text inputs without crash', () => {
      const longDest = 'A'.repeat(500);
      const longDate = '2026.01.01 - 2026.12.31 '.repeat(10);
      const longPax = '성인 999명, 유아 999명'.repeat(5);

      const renderer = renderWithQuery({
        ...baseProps,
        destination: longDest,
        dateText: longDate,
        paxText: longPax,
        variant: 'option3',
      });

      expect(renderer.root).toBeDefined();
    });
  });
});
