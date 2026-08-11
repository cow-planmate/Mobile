import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ItineraryViewScreen from '../src/features/itinerary/screens/ItineraryViewScreen';
import { fetchWeather } from '../src/api/trips';
import axios from 'axios';

// Mocking dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

// 소유권 조회는 이 테스트 관심사가 아니다. Provider 없이 useQuery가 돌지 않도록 대체한다.
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

// 실제 AlertProvider는 showAlert 참조를 고정한다. 목도 동일하게 고정해야
// 이 참조에 의존하는 콜백/이펙트가 매 렌더 재실행되지 않는다.
// (팩토리 밖 변수를 참조하면 호이스팅으로 TDZ에 걸리므로 안에서 만든다)
jest.mock('../src/contexts/AlertContext', () => {
  const value = { showAlert: jest.fn() };
  return { useAlert: () => value };
});

// Mock KakaoMapView to avoid syntax or layout errors in tests
jest.mock('../src/features/itinerary/components/KakaoMapView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View);
});

describe('ItineraryViewScreen - Loading & Weather Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maintains loading until weather is fully loaded', async () => {
    // 서버 PlanFrameDetailDto와 같은 키를 쓴다.
    // 예전 픽스처는 구 스키마 필드를 사용했지만
    // 실제 응답으로는 재현되지 않는 경로를 검증하고 있었다.
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

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ItineraryViewScreen navigation={mockNavigation} route={mockRoute} />
      );
    });

    expect(renderer).toBeDefined();

    // Check if the inner view component receives isWeatherLoading as true initially
    const viewComponent = renderer!.root.findByType(
      require('../src/features/itinerary/screens/ItineraryViewScreen.view').default
    );
    expect(viewComponent.props.isWeatherLoading).toBe(true);

    // Resolve the weather promise to simulate weather load completion
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

    // Check if isWeatherLoading becomes false after weather promise is resolved
    expect(viewComponent.props.isWeatherLoading).toBe(false);
  });

  it('passes itinerary dates when navigating back to the editor', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'success', planFrame: {}, placeBlocks: [], timetables: [] },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    const route = {
      params: {
        planId: '123',
        days: [
          { date: new Date(2026, 7, 1), dayNumber: 1, places: [] },
          { date: new Date(2026, 7, 3), dayNumber: 2, places: [] },
        ],
      },
    } as any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ItineraryViewScreen navigation={mockNavigation} route={route} />,
      );
    });

    const viewComponent = renderer!.root.findByType(
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
