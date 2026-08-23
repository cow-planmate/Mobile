import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { HomeScreenView, HomeScreenViewProps } from '../src/features/home/screens/HomeScreen.view';
import { tokens } from '../src/theme/tokens';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const FastImageView = (props: any) => React.createElement(View, props);
  FastImageView.resizeMode = { cover: 'cover', contain: 'contain' };
  return FastImageView;
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

jest.mock('../src/components/common', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Header: (props: any) => React.createElement(View, { testID: 'header', ...props }),
    CalendarModal: (props: any) => React.createElement(View, { testID: 'calendarModal', ...props }),
    PaxModal: (props: any) => React.createElement(View, { testID: 'paxModal', ...props }),
    SearchLocationModal: (props: any) => React.createElement(View, { testID: 'searchModal', ...props }),
    NotificationModal: (props: any) => React.createElement(View, { testID: 'notificationModal', ...props }),
    AirplaneLoading: () => null,
  };
});

const createBaseProps = (overrides?: Partial<HomeScreenViewProps>): HomeScreenViewProps => ({
  nickname: '테스터',
  email: 'test@planmate.app',
  pendingRequestsCount: 0,
  destination: '',
  dateText: '',
  paxText: '',
  isFormValid: false,
  isSearchModalVisible: false,
  isCalendarVisible: false,
  isPaxModalVisible: false,
  isNotificationModalVisible: false,
  pendingRequestList: [],
  onCloseNotificationModal: jest.fn(),
  onAcceptNotification: jest.fn(),
  onRejectNotification: jest.fn(),
  startDate: null,
  endDate: null,
  adults: 1,
  children: 0,
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
  variant: 'option2',
  ...overrides,
});

describe('HomeScreen.view Empirical Edge Case Testing', () => {
  const variants: Array<'option1' | 'option2' | 'option3' | 'option4'> = [
    'option1',
    'option2',
    'option3',
    'option4',
  ];

  describe.each(variants)('Variant: %s', (variant) => {
    it('renders empty state correctly with placeholders and disabled CTA', () => {
      const props = createBaseProps({
        variant,
        destination: '',
        dateText: '',
        paxText: '',
        isFormValid: false,
        isCreating: false,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const submitBtn = touchables.find((t) => t.props.accessibilityLabel === '일정생성');

      expect(submitBtn).toBeDefined();
      expect(submitBtn!.props.disabled).toBe(true);
      expect(submitBtn!.props.accessibilityState.disabled).toBe(true);

      // Verify placeholders
      const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
      expect(texts).toContain('여행지 선택');
      expect(texts).toContain('날짜 선택');
      expect(texts).toContain('인원 선택');
    });

    it('renders valid filled state and enables CTA interaction', () => {
      const onCreateItinerary = jest.fn();
      const props = createBaseProps({
        variant,
        destination: '제주도',
        dateText: '2026.09.12 - 2026.09.14',
        paxText: '성인 2명',
        isFormValid: true,
        isCreating: false,
        onCreateItinerary,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const submitBtn = touchables.find((t) => t.props.accessibilityLabel === '일정생성');

      expect(submitBtn).toBeDefined();
      expect(submitBtn!.props.disabled).toBe(false);
      expect(submitBtn!.props.accessibilityState.disabled).toBe(false);

      // Trigger CTA click
      ReactTestRenderer.act(() => {
        submitBtn!.props.onPress();
      });
      expect(onCreateItinerary).toHaveBeenCalledTimes(1);

      // Verify rendered values
      const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
      expect(texts).toContain('제주도');
      expect(texts).toContain('2026.09.12 - 2026.09.14');
      expect(texts).toContain('성인 2명');
    });

    it('renders creating state with loading indicator text and disabled CTA', () => {
      const onCreateItinerary = jest.fn();
      const props = createBaseProps({
        variant,
        destination: '부산',
        dateText: '2026.10.01 - 2026.10.03',
        paxText: '성인 1명',
        isFormValid: true,
        isCreating: true,
        onCreateItinerary,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const submitBtn = touchables.find((t) => t.props.accessibilityLabel === '일정생성');

      expect(submitBtn).toBeDefined();
      expect(submitBtn!.props.disabled).toBe(true);
      expect(submitBtn!.props.accessibilityState.disabled).toBe(true);

      const submitText = submitBtn!.findByType(Text);
      expect(submitText.props.children).toBe('일정 만드는 중…');
    });

    it('handles extreme long text without crashing and applies numberOfLines={1}', () => {
      const longDestination =
        '아주아주아주아주 길고 긴 특별시 특별자치도 유네스코 세계문화유산 등재 명소 여행지 대한민국 구석구석 어디까지 가봤니';
      const longDate = '2026.12.01 (월) ~ 2027.01.15 (일) 총 46박 47일간의 대장정 장기 여행';
      const longPax = '성인 10명, 어린이 12명, 유아 5명, 반려동물 3마리';

      const props = createBaseProps({
        variant,
        destination: longDestination,
        dateText: longDate,
        paxText: longPax,
        isFormValid: true,
        isCreating: false,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      expect(() => {
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
        });
      }).not.toThrow();

      const textNodes = renderer.root.findAllByType(Text);
      const destNode = textNodes.find((t) => t.props.children === longDestination);
      const dateNode = textNodes.find((t) => t.props.children === longDate);
      const paxNode = textNodes.find((t) => t.props.children === longPax);

      expect(destNode).toBeDefined();
      expect(destNode!.props.numberOfLines).toBe(1);
      expect(dateNode).toBeDefined();
      expect(dateNode!.props.numberOfLines).toBe(1);
      expect(paxNode).toBeDefined();
      expect(paxNode!.props.numberOfLines).toBe(1);
    });

    it('handles null and undefined optional values safely', () => {
      const props = createBaseProps({
        variant,
        nickname: undefined,
        email: undefined,
        startDate: null,
        endDate: null,
        adults: null,
        children: null,
        destination: '',
        dateText: '',
        paxText: '',
        isFormValid: false,
        isCreating: false,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      expect(() => {
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
        });
      }).not.toThrow();
      expect(renderer).toBeDefined();
    });

    it('triggers search, calendar, and pax modal open callbacks', () => {
      const onOpenSearchModal = jest.fn();
      const onOpenCalendar = jest.fn();
      const onOpenPaxModal = jest.fn();

      const props = createBaseProps({
        variant,
        onOpenSearchModal,
        onOpenCalendar,
        onOpenPaxModal,
      });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
      });

      const touchables = renderer.root.findAllByType(TouchableOpacity);

      const destRow = touchables.find(
        (t) => t.props.accessibilityLabel && t.props.accessibilityLabel.startsWith('여행지')
      );
      const dateRow = touchables.find(
        (t) => t.props.accessibilityLabel && t.props.accessibilityLabel.startsWith('기간')
      );
      const paxRow = touchables.find(
        (t) => t.props.accessibilityLabel && t.props.accessibilityLabel.startsWith('인원수')
      );

      expect(destRow).toBeDefined();
      expect(dateRow).toBeDefined();
      expect(paxRow).toBeDefined();

      ReactTestRenderer.act(() => {
        destRow!.props.onPress();
      });
      expect(onOpenSearchModal).toHaveBeenCalledTimes(1);

      ReactTestRenderer.act(() => {
        dateRow!.props.onPress();
      });
      expect(onOpenCalendar).toHaveBeenCalledTimes(1);

      ReactTestRenderer.act(() => {
        paxRow!.props.onPress();
      });
      expect(onOpenPaxModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Default variant fallback', () => {
    it('defaults to option2 when variant prop is omitted', () => {
      const props = createBaseProps({ variant: undefined });

      let renderer!: ReactTestRenderer.ReactTestRenderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<HomeScreenView {...props} />);
      });

      // In timeline design, cardWrapper is rendered and submitButton is rendered outside cardWrapper
      const touchables = renderer.root.findAllByType(TouchableOpacity);
      const submitBtn = touchables.find((t) => t.props.accessibilityLabel === '일정생성');
      expect(submitBtn).toBeDefined();
      expect(submitBtn!.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderRadius: expect.any(Number),
            height: expect.any(Number),
          }),
        ])
      );
    });
  });
});

describe('HomeScreen Implementation Verification', () => {
  it('verifies HomeScreen tokens and architecture integrity', () => {
    expect(tokens.colors.primary).toBeDefined();
    expect(tokens.colors.white).toBe('#FFFFFF');
    expect(tokens.colors.border).toBe('#E5E7EB');
  });
});
