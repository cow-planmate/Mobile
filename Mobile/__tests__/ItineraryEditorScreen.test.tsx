import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

jest.mock('@react-navigation/material-top-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    createMaterialTopTabNavigator: () => {
      return {
        Navigator: ({ children }: any) => (
          <View testID="mock-top-tab-navigator">{children}</View>
        ),
        Screen: ({ name, children, component }: any) => {
          const renderedContent =
            typeof children === 'function'
              ? children()
              : component
              ? React.createElement(component)
              : null;
          return (
            <View testID={`mock-tab-screen-${name}`}>{renderedContent}</View>
          );
        },
      };
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  TabActions: {
    jumpTo: jest.fn(),
  },
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = ({ children, style }: any) =>
    React.createElement('View', { style }, children);
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
      in: () => () => 0,
      out: () => () => 0,
      inOut: () => () => 0,
      cubic: () => 0,
      linear: () => 0,
    },
    runOnJS: (fn: any) => fn,
  };
});

jest.mock('@fortawesome/react-native-fontawesome', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FontAwesomeIcon: () =>
      React.createElement(View, { testID: 'mock-fa-icon' }),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Map: () => React.createElement(View, { testID: 'mock-lucide-map-icon' }),
    ChevronLeft: () =>
      React.createElement(View, { testID: 'mock-lucide-chevron-left' }),
    ListChecks: () =>
      React.createElement(View, { testID: 'mock-lucide-list-checks' }),
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
    CATEGORY_NAMES: { 4: '검색' },
    resolveCategoryId: () => 4,
    default: ({ item }: any) =>
      React.createElement(
        Text,
        { testID: `timeline-item-${item.id}` },
        item.name,
      ),
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
    AirplaneLoading: () =>
      React.createElement(View, { testID: 'mock-airplane-loading' }),
    ScheduleEditModal: () =>
      React.createElement(View, { testID: 'mock-schedule-edit-modal' }),
    TimePickerModal: () =>
      React.createElement(View, { testID: 'mock-time-picker-modal' }),
    PlanInfoModal: () =>
      React.createElement(View, { testID: 'mock-plan-info-modal' }),
    ShareModal: () => React.createElement(View, { testID: 'mock-share-modal' }),
  };
});

jest.mock(
  '../src/features/itinerary/components/PlaceRecommendationList',
  () => {
    const React = require('react');
    const { View } = require('react-native');
    const Mock = () =>
      React.createElement(View, { testID: 'mock-place-recommendation-list' });
    Mock.__esModule = true;
    Mock.default = Mock;
    Mock.PLACE_TABS = ['관광지', '숙소', '식당', '직접 추가', '검색'];
    Mock.PLACE_PICK_UP_MS = 350;
    return Mock;
  },
);

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

jest.mock(
  '@env',
  () => ({
    API_URL: 'mock-api-url',
  }),
  { virtual: true },
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

import ItineraryEditorScreenView from '../src/features/itinerary/screens/ItineraryEditorScreen.view';
import { TAB_FILL } from '../src/features/itinerary/screens/ItineraryEditorScreen.styles';
import { readFileSync } from 'fs';
import { join } from 'path';
import ItineraryEditorScreen from '../src/features/itinerary/screens/ItineraryEditorScreen';
import EditAccessGate from '../src/features/itinerary/components/EditAccessGate';
import PlaceEditModal from '../src/features/itinerary/components/PlaceEditModal';
import { Day } from '../src/contexts/ItineraryContext';

const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

const mockPlanOwnership = {
  isOwner: true,
  isEditor: false,
  canEdit: true,
  isResolved: true,
  isLoading: false,
  isError: false,
};
jest.mock('../src/hooks/usePlanOwnership', () => ({
  usePlanOwnership: () => mockPlanOwnership,
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
  subscribeToMessages: jest.fn(),
  unsubscribeFromMessages: jest.fn(),
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
        type: '기타' as const,
        imageUrl: '',
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
        type: '식당' as const,
        imageUrl: '',
      },
    ],
  },
];

describe('ItineraryEditorScreenView Component', () => {
  it('correctly propagates Context values when the selected day index changes', async () => {
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
            formatDate={d => d.toISOString().split('T')[0]}
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
            onOpenChecklist={() => {}}
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

    const timelineScreenDay1 = rendererInstance!.root.findByProps({
      testID: 'editor-timeline',
    });
    expect(
      timelineScreenDay1.findByProps({ testID: 'timeline-item-1' }),
    ).toBeTruthy();
    expect(() =>
      timelineScreenDay1.findByProps({ testID: 'timeline-item-2' }),
    ).toThrow();

    const btnDay2 = rendererInstance!.root.findByProps({ testID: 'btn-day-2' });
    await act(async () => {
      btnDay2.props.onPress();
    });

    const timelineScreenDay2 = rendererInstance!.root.findByProps({
      testID: 'editor-timeline',
    });
    expect(
      timelineScreenDay2.findByProps({ testID: 'timeline-item-2' }),
    ).toBeTruthy();
    expect(() =>
      timelineScreenDay2.findByProps({ testID: 'timeline-item-1' }),
    ).toThrow();

    const btnDay1 = rendererInstance!.root.findByProps({ testID: 'btn-day-1' });
    await act(async () => {
      btnDay1.props.onPress();
    });

    const timelineScreenDay1Again = rendererInstance!.root.findByProps({
      testID: 'editor-timeline',
    });
    expect(
      timelineScreenDay1Again.findByProps({ testID: 'timeline-item-1' }),
    ).toBeTruthy();
    expect(() =>
      timelineScreenDay1Again.findByProps({ testID: 'timeline-item-2' }),
    ).toThrow();
  });

  it('renders undo button integrated with place sheet', async () => {
    const mockUndo = jest.fn();

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
          formatDate={d => d.toISOString().split('T')[0]}
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
          onOpenChecklist={() => {}}
          onUndo={mockUndo}
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
        />,
      );
    });

    expect(rendererInstance).toBeDefined();

    const undoButton = rendererInstance!.root.findByProps({
      testID: 'btn-undo',
    });
    expect(undoButton).toBeDefined();

    // 아이콘은 lucide 딥임포트로 렌더된다 — 버튼에 아이콘이 붙어 있는지 확인
    expect(
      React.Children.count(undoButton?.props.children),
    ).toBeGreaterThanOrEqual(1);

    await act(async () => {
      undoButton?.props.onPress();
    });

    expect(mockUndo).toHaveBeenCalledTimes(1);
  });
});

describe('ItineraryEditorScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockWebSocket.isConnected = false;
    mockItineraryEditor.planMetadata = {};
    mockPlanOwnership.isOwner = true;
    mockPlanOwnership.isEditor = false;
    mockPlanOwnership.canEdit = true;
    mockPlanOwnership.isResolved = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('장소 이동 미리보기 중에는 저장하지 않고 놓을 때 한 번만 추가한다', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    const navigation = {
      addListener: jest.fn(() => jest.fn()),
      goBack: jest.fn(),
      navigate: jest.fn(),
      setParams: jest.fn(),
    } as any;
    const route = {
      params: { planId: 'plan-123', destination: '제주도' },
    } as any;
    const RecommendationList = require('../src/features/itinerary/components/PlaceRecommendationList');
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ItineraryEditorScreen route={route} navigation={navigation} />,
      );
    });
    tree!.root
      .findAll(node => jest.isMockFunction(node.instance?.measureInWindow))
      .forEach(node => {
        node.instance.measureInWindow.mockImplementation(
          (
            callback: (
              x: number,
              y: number,
              width: number,
              height: number,
            ) => void,
          ) => callback(0, 100, 400, 600),
        );
      });
    const place = {
      ...mockDays[0].places[0],
      id: 'new-place',
      name: '새 장소',
    };
    act(() => {
      tree!.root.findByType(RecommendationList).props.onPickUpPlace(place, 300);
    });
    expect(
      tree!.root.findByType(ItineraryEditorScreenView).props.pendingPlace.name,
    ).toBe('새 장소');
    expect(mockItineraryEditor.handleAddPlace).not.toHaveBeenCalled();
    act(() => {
      tree!.root.findByType(RecommendationList).props.onDragPlace(200);
      tree!.root.findByType(RecommendationList).props.onDropPlace(200);
    });
    expect(mockItineraryEditor.handleAddPlace).toHaveBeenCalledTimes(1);
    expect(mockItineraryEditor.handleAddPlace).toHaveBeenCalledWith(
      expect.objectContaining({ name: '새 장소' }),
    );
    expect(
      tree!.root.findByType(ItineraryEditorScreenView).props.pendingPlace,
    ).toBeNull();
    act(() => tree!.unmount());
  });

  it('장소 편집 창에서 바꾼 필드만 저장하여 다른 사람의 시간 변경을 보존한다', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    const navigation = {
      addListener: jest.fn(() => jest.fn()),
      goBack: jest.fn(),
      navigate: jest.fn(),
      setParams: jest.fn(),
    } as any;
    const route = {
      params: { planId: 'plan-123', destination: '제주도' },
    } as any;
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ItineraryEditorScreen route={route} navigation={navigation} />,
      );
    });
    const place = mockDays[0].places[0];
    await act(async () => {
      tree!.root
        .findByType(ItineraryEditorScreenView)
        .props.onOpenDetail(place);
    });
    mockItineraryEditor.days = [
      { ...mockDays[0], places: [{ ...place, startTime: '11:00:00' }] },
    ];
    await act(async () => {
      tree!.update(
        <ItineraryEditorScreen route={route} navigation={navigation} />,
      );
    });
    await act(async () => {
      tree!.root
        .findByType(PlaceEditModal)
        .props.onSave({ ...place, memo: '메모만 변경' });
    });
    expect(mockItinerary.updatePlaceDetails).toHaveBeenCalledWith(0, place.id, {
      memo: '메모만 변경',
    });
    await act(async () => {
      tree!.unmount();
    });
  });

  it('연결 중 이름을 저장한 뒤 완료해도 REST로 같은 이름을 다시 덮어쓰지 않는다', async () => {
    mockWebSocket.isConnected = true;
    mockItineraryEditor.planMetadata = {
      planName: '이전 이름',
      adultCount: 3,
      childCount: 2,
    };
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    const navigation = {
      addListener: jest.fn(() => jest.fn()),
      goBack: jest.fn(),
      navigate: jest.fn(),
      setParams: jest.fn(),
    } as any;
    const route = {
      params: { planId: 'plan-123', destination: '제주도' },
    } as any;
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ItineraryEditorScreen route={route} navigation={navigation} />,
      );
    });
    await act(async () => {
      await tree!.root
        .findByType(ItineraryEditorScreenView)
        .props.onSaveTripName();
      await tree!.root.findByType(ItineraryEditorScreenView).props.onComplete();
    });
    expect(
      mockWebSocket.sendMessage.mock.calls.filter(call => call[1] === 'plan'),
    ).toHaveLength(1);
    expect(mockWebSocket.sendMessage).toHaveBeenCalledWith('update', 'plan', {
      planId: 'plan-123',
      planName: mockItineraryEditor.tripName,
      adultCount: 3,
      childCount: 2,
    });
    expect(axios.patch).not.toHaveBeenCalled();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('권한이 없으면 편집을 막고 수락 후 권한이 갱신되면 같은 화면에서 연결한다', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    mockPlanOwnership.isOwner = false;
    mockPlanOwnership.canEdit = false;

    const mockAddListener = jest.fn<
      () => jest.Mock,
      [string, (...args: any[]) => void]
    >(() => jest.fn());
    const mockNavigation = {
      addListener: mockAddListener,
      goBack: jest.fn(),
      navigate: jest.fn(),
      dispatch: jest.fn(),
      setParams: jest.fn(),
      isFocused: () => true,
    } as any;

    const mockRoute = {
      params: { planId: 'plan-123', destination: '제주도' },
    } as any;

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    expect(tree!.root.findByType(EditAccessGate).props.visible).toBe(true);
    expect(mockWebSocket.connect).not.toHaveBeenCalled();

    const beforeRemoveHandler = mockAddListener.mock.calls.find(
      call => call[0] === 'beforeRemove',
    )?.[1];

    const mockPreventDefault = jest.fn();
    await act(async () => {
      beforeRemoveHandler!({
        preventDefault: mockPreventDefault,
        data: { action: { type: 'GO_BACK' } },
      });
    });

    expect(mockPreventDefault).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
    mockPlanOwnership.isEditor = true;
    mockPlanOwnership.canEdit = true;
    await act(async () => {
      tree!.update(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });
    expect(tree!.root.findByType(EditAccessGate).props.visible).toBe(false);
    expect(mockWebSocket.connect).toHaveBeenCalledWith('plan-123');
    await act(async () => {
      tree!.unmount();
    });
  });

  it('registers beforeRemove listener and shows warning alert on exit', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];

    const mockAddListener = jest.fn<
      () => jest.Mock,
      [string, (...args: any[]) => void]
    >(() => jest.fn());
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

    await act(async () => {
      renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    expect(mockAddListener).toHaveBeenCalledWith(
      'beforeRemove',
      expect.any(Function),
    );

    const beforeRemoveHandler = mockAddListener.mock.calls.find(
      call => call[0] === 'beforeRemove',
    )?.[1];

    expect(beforeRemoveHandler).toBeDefined();

    const mockPreventDefault = jest.fn();
    const mockAction = { type: 'GO_BACK' };
    const mockEvent = {
      preventDefault: mockPreventDefault,
      data: { action: mockAction },
    };

    await act(async () => {
      beforeRemoveHandler!(mockEvent);
    });

    expect(mockPreventDefault).toHaveBeenCalled();

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '변경사항 저장 안 됨',
        type: 'warning',
        buttons: expect.any(Array),
      }),
    );

    const alertOptions = mockShowAlert.mock.calls[0][0];
    const leaveButton = alertOptions.buttons.find(
      (btn: any) => btn.text === '나가기',
    );
    expect(leaveButton).toBeDefined();

    await act(async () => {
      leaveButton.onPress();
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1200);
    });

    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it('does not show warning alert when completed via onComplete', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];

    const mockAddListener = jest.fn<
      () => jest.Mock,
      [string, (...args: any[]) => void]
    >(() => jest.fn());
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
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    const viewComponent = rendererInstance!.root.findByType(
      ItineraryEditorScreenView,
    );
    expect(viewComponent).toBeDefined();

    await act(async () => {
      viewComponent.props.onComplete();
    });

    const beforeRemoveHandler = mockAddListener.mock.calls.find(
      call => call[0] === 'beforeRemove',
    )?.[1];
    expect(beforeRemoveHandler).toBeDefined();

    const mockPreventDefault = jest.fn();
    const mockEvent = {
      preventDefault: mockPreventDefault,
      data: { action: { type: 'GO_BACK' } },
    };

    await act(async () => {
      beforeRemoveHandler!(mockEvent);
    });

    expect(mockPreventDefault).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('최초 방 입장과 소켓 재연결 후 최신 일정을 조회한다', async () => {
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

    await act(async () => {
      rendererInstance = renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });
    expect(mockItineraryEditor.fetchPlanDetails).toHaveBeenCalledTimes(1);

    mockWebSocket.isConnected = false;
    await act(async () => {
      rendererInstance!.update(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });
    expect(mockItineraryEditor.fetchPlanDetails).toHaveBeenCalledTimes(1);

    mockWebSocket.isConnected = true;
    await act(async () => {
      rendererInstance!.update(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    expect(mockItineraryEditor.fetchPlanDetails).toHaveBeenCalledTimes(2);
  });

  it('제목을 다시 저장해도 값이 그대로면 요청을 한 번만 보낸다', async () => {
    mockItineraryEditor.days = mockDays;
    mockItineraryEditor.selectedDay = mockDays[0];
    mockItineraryEditor.tripName = '제주도 여행';
    mockItineraryEditor.planMetadata = {};

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

    await act(async () => {
      rendererInstance = renderer.create(
        <ItineraryEditorScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    const viewComponent = rendererInstance!.root.findByType(
      ItineraryEditorScreenView,
    );

    await act(async () => {
      await viewComponent.props.onSaveTripName();
    });
    await act(async () => {
      await viewComponent.props.onSaveTripName();
    });

    const planUpdateCalls = mockWebSocket.sendMessage.mock.calls.filter(
      (call: any[]) => call[0] === 'update' && call[1] === 'plan',
    );
    expect(planUpdateCalls).toHaveLength(1);
  });
});

// 웹 Create2에 맞춘 자리들. 되돌아가면 여기서 걸린다.
describe('웹과 맞춘 일정 편집 문구', () => {
  it('갈래 탭 채움 색이 갈래마다 다르다', () => {
    const fills = Object.values(TAB_FILL);
    expect(fills).toHaveLength(5);
    // 다섯 개가 서로 달라야 갈래를 색으로 가릴 수 있다.
    expect(new Set(fills).size).toBe(5);
    // 흰 글자를 얹으므로 500 계열(밝은 쪽)이 섞이면 안 된다.
    expect(fills).not.toContain('#84cc16');
    expect(TAB_FILL['관광지']).toBe('#4D7C0F');
  });

  it('놓을 자리 안내가 이름 뒤에 조사를 붙이지 않는다', () => {
    const source = readFileSync(
      join(
        __dirname,
        '../src/features/itinerary/screens/ItineraryEditorScreen.view.tsx',
      ),
      'utf8',
    );

    expect(source).toContain("'{pendingPlace.name}' 놓을 자리를 눌러 주세요");
    // 폰에는 클릭이 없고, '우도'을처럼 받침을 안 보는 조사도 쓰지 않는다.
    expect(source).not.toContain('클릭해 주세요');
    expect(source).not.toContain("'을 배치할");
  });
});

describe('일정 편집기 제스처 및 UI 동작 개선', () => {
  const source = readFileSync(
    join(
      __dirname,
      '../src/features/itinerary/screens/ItineraryEditorScreen.view.tsx',
    ),
    'utf8',
  );

  it('중복 라벨(movingPlace)이 제거되었다', () => {
    expect(source).not.toContain('styles.movingPlace');
    expect(source).not.toContain('movingPlaceName');
  });

  it('실행 취소 버튼이 플로팅 버튼으로 시트와 동기화되어 렌더된다', () => {
    expect(source).toContain('styles.floatingHistoryContainer');
    expect(source).toContain('styles.floatingHistoryButton');
    expect(source).not.toContain('styles.sheetTopBar');
  });

  it('카드 이동 제스처에 activateAfterLongPress가 설정되어 스크롤과 분리된다', () => {
    expect(source).toContain('.activateAfterLongPress(200)');
    expect(source).toContain('scrollEnabled={!isItemDragging && !isDragging}');
  });

  it('장소 추가 시 터치 오프셋 보정(FINGER_TARGET_OFFSET)과 Math.floor를 적용한다', () => {
    expect(source).toContain('FINGER_TARGET_OFFSET = 20');
    expect(source).toContain('Math.floor(minutes / 15) * 15');
  });

  it('카드 드래그 중 의도치 않은 시간표 스크롤을 유발하던 startScrollInterval이 제거되었다', () => {
    expect(source).not.toContain('startScrollInterval');
    expect(source).not.toContain('clearScrollInterval');
  });

  it('다른 아이템 드래그 또는 새 장소 배치 중에는 카드 제스처가 비활성화된다', () => {
    expect(source).toContain('draggingPlaceId !== place.id');
    expect(source).toContain('.enabled(!disabled)');
  });

  it('카드 삭제 시 구식 수평 슬라이드 대신 마이크로 축소 및 침강 애니메이션과 중복 인터랙션 차단이 적용된다', () => {
    expect(source).not.toContain('exitTranslateX');
    expect(source).toContain('exitTranslateY');
    expect(source).toContain('Easing.bezier(0.25, 1, 0.5, 1)');
    expect(source).toContain("pointerEvents={isDeleting ? 'none' : 'auto'}");
    expect(source).toContain('isDeletingRef.current');
  });

  it('장소 추가 시트가 날씨 헤더 바로 밑까지 최대 확장되며 1.0 스냅을 지원한다', () => {
    expect(source).toContain('SHEET_SNAPS = [0, 1 / 3, 2 / 3, 1]');
    expect(source).toContain('sheetTopGap = hasWeather ? 72 : 8');
  });
});
