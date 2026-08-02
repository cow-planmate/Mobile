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

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const FastImage = (props: any) => React.createElement(View, props);
  (FastImage as any).priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  (FastImage as any).resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  return FastImage;
});

jest.mock('@env', () => ({
  API_URL: 'mock-api-url',
}), { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

import ItineraryEditorScreenView from '../src/features/itinerary/screens/ItineraryEditorScreen.view';
import ItineraryEditorScreen from '../src/features/itinerary/screens/ItineraryEditorScreen';
import { Day } from '../src/contexts/ItineraryContext';

// Mocks for ItineraryEditorScreen container component
const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

const mockMutateAsync = jest.fn();
jest.mock('../src/hooks/usePlanQueries', () => ({
  useCreateFullPlan: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

const mockWebSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  onlineUsers: [],
  sendMessage: jest.fn(),
  isConnected: false,
};
jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => mockWebSocket,
}));

const mockItinerary = {
  updatePlaceMemo: jest.fn(),
  updatePlaceDetails: jest.fn(),
  setDays: jest.fn(),
};
jest.mock('../src/contexts/ItineraryContext', () => ({
  useItinerary: () => mockItinerary,
}));

const mockPlaces = {
  fetchAllRecommendations: jest.fn(),
  fetchAllRecommendationsNoAuth: jest.fn(),
  resetPlaces: jest.fn(),
};
jest.mock('../src/contexts/PlacesContext', () => ({
  usePlaces: () => mockPlaces,
}));

const mockItineraryEditor = {
  days: [] as Day[],
  selectedDayIndex: 0,
  setSelectedDayIndex: jest.fn(),
  tripName: '제주도 여행',
  setTripName: jest.fn(),
  isEditingTripName: false,
  setIsEditingTripName: jest.fn(),
  isTimePickerVisible: false,
  setTimePickerVisible: jest.fn(),
  editingTime: null as any,
  setEditingTime: jest.fn(),
  timelineScrollRef: { current: null } as any,
  formatDate: (d: Date) => d.toISOString().split('T')[0],
  handleEditTime: jest.fn(),
  handleUpdatePlaceTimes: jest.fn(),
  handleDeletePlace: jest.fn(),
  handleAddPlace: jest.fn(),
  selectedDay: null as any,
  planMetadata: {},
  fetchPlanDetails: jest.fn(),
};
jest.mock('../src/hooks/useItineraryEditor', () => ({
  useItineraryEditor: () => mockItineraryEditor,
}));

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
            onOpenDetail={() => {}}
            weatherMap={{}}
            onOpenPlanInfo={() => {}}
            onGoBack={() => {}}
            pendingPlace={null}
            previewStartTime={null}
            previewEndTime={null}
            setPreviewStartTime={() => {}}
            setPreviewEndTime={() => {}}
            onConfirmPlacement={() => {}}
            onCancelPlacement={() => {}}
            onCancelPreview={() => {}}
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

  it('renders undo and redo buttons in the Timeline screen', async () => {
    const mockUndo = jest.fn();
    const mockRedo = jest.fn();

    let rendererInstance: renderer.ReactTestRenderer | undefined;

    await act(async () => {
      rendererInstance = renderer.create(
        <ItineraryEditorScreenView
          days={mockDays}
          selectedDayIndex={0}
          setSelectedDayIndex={() => {}}
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
          selectedDay={mockDays[0]}
          isScheduleEditVisible={false}
          setScheduleEditVisible={() => {}}
          onConfirmScheduleEdit={() => {}}
          onConfirmTimePicker={() => {}}
          destination="제주도"
          onComplete={() => {}}
          onOpenParticipants={() => {}}
          onOpenMap={() => {}}
          onOpenShare={() => {}}
          onUndo={mockUndo}
          onRedo={mockRedo}
          participantsCount={0}
          planId={null}
          onOpenDetail={() => {}}
          weatherMap={{}}
          onOpenPlanInfo={() => {}}
          onGoBack={() => {}}
          pendingPlace={null}
          previewStartTime={null}
          previewEndTime={null}
          setPreviewStartTime={() => {}}
          setPreviewEndTime={() => {}}
          onConfirmPlacement={() => {}}
          onCancelPlacement={() => {}}
          onCancelPreview={() => {}}
        />
      );
    });

    expect(rendererInstance).toBeDefined();

    const timelineScreen = rendererInstance?.root.findByProps({
      testID: 'mock-tab-screen-타임라인',
    });

    const iconViews = timelineScreen?.findAllByProps({ testID: 'mock-fa-icon' });
    expect(iconViews?.length).toBeGreaterThanOrEqual(2);

    const undoButton = timelineScreen?.findByProps({ testID: 'btn-undo' });
    const redoButton = timelineScreen?.findByProps({ testID: 'btn-redo' });

    expect(undoButton).toBeDefined();
    expect(redoButton).toBeDefined();

    await act(async () => {
      undoButton?.props.onPress();
      redoButton?.props.onPress();
    });

    expect(mockUndo).toHaveBeenCalledTimes(1);
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });
});

describe('ItineraryEditorScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockWebSocket.isConnected = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers beforeRemove listener and shows warning alert on exit', async () => {
    // Setup mock days to trigger the exit warning check
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];

    // addListener는 항상 unsubscribe 함수를 반환한다(React Navigation 계약).
    const mockAddListener = jest.fn(() => jest.fn());
    const mockDispatch = jest.fn();
    const mockNavigation = {
      addListener: mockAddListener,
      goBack: jest.fn(),
      navigate: jest.fn(),
      dispatch: mockDispatch,
      setParams: jest.fn(),
    } as any;

    const mockRoute = {
      params: {
        planId: 'plan-123',
        destination: '제주도',
      },
    } as any;

    // Render component
    await act(async () => {
      renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />
      );
    });

    // Verify beforeRemove listener was registered
    expect(mockAddListener).toHaveBeenCalledWith('beforeRemove', expect.any(Function));

    // Find the beforeRemove handler callback
    const beforeRemoveHandler = mockAddListener.mock.calls.find(
      (call) => call[0] === 'beforeRemove'
    )?.[1];

    expect(beforeRemoveHandler).toBeDefined();

    // Trigger beforeRemove event
    const mockPreventDefault = jest.fn();
    const mockAction = { type: 'GO_BACK' };
    const mockEvent = {
      preventDefault: mockPreventDefault,
      data: { action: mockAction },
    };

    await act(async () => {
      beforeRemoveHandler(mockEvent);
    });

    // Alert should have been prevented
    expect(mockPreventDefault).toHaveBeenCalled();

    // Custom Alert should be shown
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '변경사항 저장 안 됨',
        type: 'warning',
        buttons: expect.any(Array),
      })
    );

    // Get the buttons passed to showAlert
    const alertOptions = mockShowAlert.mock.calls[0][0];
    const leaveButton = alertOptions.buttons.find(
      (btn: any) => btn.text === '나가기'
    );
    expect(leaveButton).toBeDefined();

    // Press '나가기' (leave) button
    await act(async () => {
      leaveButton.onPress();
    });

    // Dispatch should be called after 1200ms timeout
    expect(mockDispatch).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });

    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it('does not show warning alert when completed via onComplete', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];

    // addListener는 항상 unsubscribe 함수를 반환한다(React Navigation 계약).
    const mockAddListener = jest.fn(() => jest.fn());
    const mockNavigation = {
      addListener: mockAddListener,
      goBack: jest.fn(),
      navigate: jest.fn(),
      dispatch: jest.fn(),
      setParams: jest.fn(),
    } as any;

    const mockRoute = {
      params: {
        planId: 'plan-123',
        destination: '제주도',
      },
    } as any;

    let rendererInstance: renderer.ReactTestRenderer | undefined;

    await act(async () => {
      rendererInstance = renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />
      );
    });

    // Find ItineraryEditorScreenView to call onComplete
    const viewComponent = rendererInstance?.root.findByType(ItineraryEditorScreenView);
    expect(viewComponent).toBeDefined();

    // Trigger completion
    await act(async () => {
      viewComponent.props.onComplete();
    });

    // Get the registered beforeRemove handler
    const beforeRemoveHandler = mockAddListener.mock.calls.find(
      (call) => call[0] === 'beforeRemove'
    )?.[1];
    expect(beforeRemoveHandler).toBeDefined();

    // Trigger beforeRemove
    const mockPreventDefault = jest.fn();
    const mockEvent = {
      preventDefault: mockPreventDefault,
      data: { action: { type: 'GO_BACK' } },
    };

    await act(async () => {
      beforeRemoveHandler(mockEvent);
    });

    // It should NOT call preventDefault or showAlert, letting the native transition go through
    expect(mockPreventDefault).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('화면 전환 없이 소켓만 끊겼다 재연결되면 자동으로 재조회한다', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    mockWebSocket.isConnected = true;

    const mockNavigation = {
      addListener: jest.fn(() => jest.fn()),
      goBack: jest.fn(),
      navigate: jest.fn(),
      dispatch: jest.fn(),
      setParams: jest.fn(),
    } as any;

    const mockRoute = {
      params: { planId: 'plan-123', destination: '제주도' },
    } as any;

    let rendererInstance: renderer.ReactTestRenderer | undefined;

    // 연결된 상태로 마운트 — 최초 연결 시점에는 재조회하지 않아야 한다.
    await act(async () => {
      rendererInstance = renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />
      );
    });
    expect(mockItineraryEditor.fetchPlanDetails).not.toHaveBeenCalled();

    // blur/appstate를 거치지 않고 소켓만 예기치 않게 끊김
    mockWebSocket.isConnected = false;
    await act(async () => {
      rendererInstance!.update(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />
      );
    });
    expect(mockItineraryEditor.fetchPlanDetails).not.toHaveBeenCalled();

    // 서버가 자동 재연결
    mockWebSocket.isConnected = true;
    await act(async () => {
      rendererInstance!.update(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />
      );
    });

    expect(mockItineraryEditor.fetchPlanDetails).toHaveBeenCalledTimes(1);
  });
});
