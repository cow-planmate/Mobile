import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { View, Text, Button } from 'react-native';

// Mock React Navigation material top tabs
jest.mock('@react-navigation/material-top-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    createMaterialTopTabNavigator: () => {
      return {
        Navigator: ({ children }: any) => <View testID="mock-top-tab-navigator">{children}</View>,
        Screen: ({ name, children, component }: any) => {
          const renderedContent = typeof children === 'function' ? children() : (component ? React.createElement(component) : null);
          return (
            <View testID={`mock-tab-screen-${name}`}>
              {renderedContent}
            </View>
          );
        },
      };
    },
  };
});

// Mock other external and native dependencies
jest.mock('@react-navigation/native', () => ({
  TabActions: {
    jumpTo: jest.fn(),
  },
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: any) => <View>{children}</View>,
    GestureDetector: ({ children }: any) => <View>{children}</View>,
    Gesture: {
      Pan: () => ({
        minDistance: () => ({
          onBegin: () => ({
            onUpdate: () => ({
              onEnd: () => ({
                onFinalize: () => {},
              }),
            }),
          }),
        }),
      }),
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = ({ children, style }: any) => React.createElement('View', { style }, children);
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (fn: any) => fn(),
    withSpring: (val: any) => val,
    withTiming: (val: any) => val,
    withSequence: (...vals: any[]) => vals[0],
    Easing: {
      out: () => {},
      cubic: () => {},
    },
    runOnJS: (fn: any) => fn,
  };
});

jest.mock('@fortawesome/react-native-fontawesome', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FontAwesomeIcon: () => React.createElement(View, { testID: 'mock-fa-icon' }),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Map: () => React.createElement(View, { testID: 'mock-lucide-map-icon' }),
    ChevronLeft: () => React.createElement(View, { testID: 'mock-lucide-chevron-left' }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, left: 0, right: 0, bottom: 34 }),
}));

jest.mock('../src/features/itinerary/components/TimelineItem', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ item }: any) => React.createElement(Text, { testID: `timeline-item-${item.id}` }, item.name),
  };
});

jest.mock('../src/features/itinerary/components/KakaoMapView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-kakao-map' });
});

jest.mock('../src/components/common', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AirplaneLoading: () => React.createElement(View, { testID: 'mock-airplane-loading' }),
    ScheduleEditModal: () => React.createElement(View, { testID: 'mock-schedule-edit-modal' }),
    TimePickerModal: () => React.createElement(View, { testID: 'mock-time-picker-modal' }),
    PlanInfoModal: () => React.createElement(View, { testID: 'mock-plan-info-modal' }),
    ShareModal: () => React.createElement(View, { testID: 'mock-share-modal' }),
  };
});

jest.mock('../src/features/itinerary/components/PlaceRecommendationList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-place-recommendation-list' });
});

jest.mock('../src/features/itinerary/components/weather/WeatherHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-weather-header' });
});

import ItineraryEditorScreenView from '../src/features/itinerary/screens/ItineraryEditorScreen.view';
import { Day } from '../src/contexts/ItineraryContext';

const mockDays: Day[] = [
  {
    dayNumber: 1,
    date: new Date('2024-08-01T00:00:00.000Z'),
    startTime: '09:00:00',
    endTime: '22:00:00',
    places: [
      {
        id: '1',
        name: '제주국제공항',
        address: '제주특별자치도 제주시 공항로 2',
        startTime: '09:30:00',
        endTime: '10:30:00',
        latitude: 33.5113,
        longitude: 126.493,
        category: '교통',
      },
    ],
  },
  {
    dayNumber: 2,
    date: new Date('2024-08-02T00:00:00.000Z'),
    startTime: '09:00:00',
    endTime: '21:00:00',
    places: [
      {
        id: '2',
        name: '애월 카페거리',
        address: '제주특별자치도 제주시 애월읍 애월리',
        startTime: '11:30:00',
        endTime: '13:00:00',
        latitude: 33.4623,
        longitude: 126.3106,
        category: '음식점',
      },
    ],
  },
];

describe('ItineraryEditorScreenView Component', () => {
  it('correctly propagates Context values when the selected day index changes', async () => {
    // Wrapper component to simulate State updates in parent
    const TestWrapper = () => {
      const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);

      return (
        <View>
          <Button
            title="Switch to Day 2"
            testID="btn-day-2"
            onPress={() => setSelectedDayIndex(1)}
          />
          <Button
            title="Switch to Day 1"
            testID="btn-day-1"
            onPress={() => setSelectedDayIndex(0)}
          />
          <ItineraryEditorScreenView
            days={mockDays}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            tripName="제주도 여행"
            isEditingTripName={false}
            setIsEditingTripName={() => {}}
            setTripName={() => {}}
            onSaveTripName={() => {}}
            isTimePickerVisible={false}
            setTimePickerVisible={() => {}}
            editingTime={null}
            timelineScrollRef={{ current: null } as any}
            formatDate={(d) => d.toISOString().split('T')[0]}
            handleEditTime={() => {}}
            handleUpdatePlaceTimes={() => {}}
            handleDeletePlace={() => {}}
            handleAddPlace={() => {}}
            selectedDay={mockDays[selectedDayIndex]}
            onlineUsers={[]}
            isScheduleEditVisible={false}
            setScheduleEditVisible={() => {}}
            onConfirmScheduleEdit={() => {}}
            onConfirmTimePicker={() => {}}
            destination="제주도"
            onComplete={() => {}}
            onOpenParticipants={() => {}}
            onOpenMap={() => {}}
            onOpenShare={() => {}}
            onUndo={() => {}}
            onRedo={() => {}}
            participantsCount={0}
            planId={null}
            detailPlace={null}
            isDetailVisible={false}
            onOpenDetail={() => {}}
            onCloseDetail={() => {}}
            weatherMap={{}}
            onOpenPlanInfo={() => {}}
          />
        </View>
      );
    };

    let rendererInstance: renderer.ReactTestRenderer | undefined;

    await act(async () => {
      rendererInstance = renderer.create(<TestWrapper />);
    });

    expect(rendererInstance).toBeDefined();

    // Verify day 1 places (제주국제공항) are initially rendered in the Timeline tab screen
    const timelineScreenDay1 = rendererInstance?.root.findByProps({
      testID: 'mock-tab-screen-타임라인',
    });
    expect(timelineScreenDay1.findByProps({ testID: 'timeline-item-1' })).toBeTruthy();
    expect(() => timelineScreenDay1.findByProps({ testID: 'timeline-item-2' })).toThrow();

    // Trigger state change (switch to day 2)
    const btnDay2 = rendererInstance?.root.findByProps({ testID: 'btn-day-2' });
    await act(async () => {
      btnDay2.props.onPress();
    });

    // Verify day 2 places (애월 카페거리) are now rendered and day 1 places are gone, indicating Context was successfully updated
    const timelineScreenDay2 = rendererInstance?.root.findByProps({
      testID: 'mock-tab-screen-타임라인',
    });
    expect(timelineScreenDay2.findByProps({ testID: 'timeline-item-2' })).toBeTruthy();
    expect(() => timelineScreenDay2.findByProps({ testID: 'timeline-item-1' })).toThrow();

    // Trigger state change back (switch to day 1)
    const btnDay1 = rendererInstance?.root.findByProps({ testID: 'btn-day-1' });
    await act(async () => {
      btnDay1.props.onPress();
    });

    const timelineScreenDay1Again = rendererInstance?.root.findByProps({
      testID: 'mock-tab-screen-타임라인',
    });
    expect(timelineScreenDay1Again.findByProps({ testID: 'timeline-item-1' })).toBeTruthy();
    expect(() => timelineScreenDay1Again.findByProps({ testID: 'timeline-item-2' })).toThrow();
  });
});
