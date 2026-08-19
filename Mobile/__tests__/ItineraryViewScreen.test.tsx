import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ItineraryViewScreen from '../src/features/itinerary/screens/ItineraryViewScreen';
import { fetchWeather } from '../src/api/trips';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockWebSocketConnect = jest.fn();
const mockWebSocketDisconnect = jest.fn();

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    connect: mockWebSocketConnect,
    disconnect: mockWebSocketDisconnect,
  }),
}));

jest.mock('../src/api/trips', () => ({
  fetchWeather: jest.fn(),
}));
const mockFetchWeather = fetchWeather as jest.MockedFunction<typeof fetchWeather>;

const mockNavigate = jest.fn();
const mockAddListener = jest.fn((event, callback) => {
  return () => {};
});
const mockNavigation = {
  navigate: mockNavigate,
  addListener: mockAddListener,
  setOptions: jest.fn(),
  dispatch: jest.fn(),
} as any;

const mockRoute = {
  params: {
    planId: '123',
    days: [],
    tripName: 'Test Trip',
  },
} as any;

jest.mock('@tanstack/react-query', () => {

  const client = { setQueryData: jest.fn(), getQueryState: jest.fn() };
  return { useQueryClient: () => client };
});

jest.mock('../src/hooks/usePlanOwnership', () => ({
  usePlanOwnership: () => ({ isOwner: true, isLoading: false, isError: false }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/components/common', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ShareModal: () => React.createElement(View),
    AirplaneLoading: () => React.createElement(View),
    LoadingSpinner: () => React.createElement(View),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, left: 0, right: 0, bottom: 34 }),
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: any) => React.createElement(View, null, children);
});

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
    Map: () => React.createElement(View),
    ChevronLeft: () => React.createElement(View),
    ListChecks: () => React.createElement(View),
  };
});

jest.mock('../src/contexts/AlertContext', () => {
  const value = { showAlert: jest.fn() };
  return { useAlert: () => value };
});

jest.mock('../src/features/itinerary/components/KakaoMapView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View);
});

describe('ItineraryViewScreen - Loading & Weather Logic', () => {
  // 마운트한 트리를 정리하지 않으면 화면이 잡고 있는 구독·타이머가 남아
  // jest 워커가 종료되지 못한다.
  const mountedRenderers: ReactTestRenderer.ReactTestRenderer[] = [];

  const mount = async (element: React.ReactElement) => {
    let created: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      created = ReactTestRenderer.create(element);
    });
    mountedRenderers.push(created!);
    return created!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      mountedRenderers.splice(0).forEach(instance => instance.unmount());
    });
  });

  it('maintains loading until weather is fully loaded', async () => {

    const mockPlanData = {
      message: 'success',
      planFrame: {
        planId: '0199a1b2-c3d4-7e5f-8901-234567890abc',
        planName: 'Test Trip',
        destinationId: 1,
        destinationName: '제주',
        adultCount: 1,
        childCount: 0,
      },
      placeBlocks: [],
      timetables: [
        {
          timetableId: 1,
          date: '2026-07-24',
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockPlanData });

    let weatherResolve: any;
    const weatherPromise = new Promise((resolve) => {
      weatherResolve = resolve;
    });

    mockFetchWeather.mockImplementationOnce(() => weatherPromise as any);

    const renderer = await mount(
      <ItineraryViewScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(renderer).toBeDefined();

    const viewComponent = renderer.root.findByType(
      require('../src/features/itinerary/screens/ItineraryViewScreen.view').default
    );
    expect(viewComponent.props.isWeatherLoading).toBe(true);

    await ReactTestRenderer.act(async () => {
      weatherResolve({
        weather: [
          {
            date: '2026-07-24',
            tempMin: 20,
            tempMax: 30,
            feelsLike: 25,
            description: 'Sunny',
          },
        ],
      });
    });

    expect(viewComponent.props.isWeatherLoading).toBe(false);
  });

  it('passes itinerary dates when navigating back to the editor', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'success', planFrame: {}, placeBlocks: [], timetables: [] },
    });
    const route = {
      params: {
        planId: '123',
        days: [
          { date: new Date(2026, 7, 1), dayNumber: 1, places: [] },
          { date: new Date(2026, 7, 3), dayNumber: 2, places: [] },
        ],
      },
    } as any;

    const renderer = await mount(
      <ItineraryViewScreen navigation={mockNavigation} route={route} />,
    );

    const viewComponent = renderer.root.findByType(
      require('../src/features/itinerary/screens/ItineraryViewScreen.view').default,
    );
    viewComponent.props.handleEdit();

    expect(mockNavigate).toHaveBeenCalledWith(
      'ItineraryEditor',
      expect.objectContaining({
        startDate: '2026-07-31T15:00:00.000Z',
        endDate: '2026-08-02T15:00:00.000Z',
      }),
    );
  });
});
