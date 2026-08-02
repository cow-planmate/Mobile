import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ItineraryViewScreen from '../src/features/itinerary/screens/ItineraryViewScreen';
import { fetchWeatherRecommendations } from '../src/api/trips';
import axios from 'axios';

// Mocking dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../src/api/trips', () => ({
  fetchWeatherRecommendations: jest.fn(),
}));
const mockFetchWeatherRecommendations = fetchWeatherRecommendations as jest.MockedFunction<typeof fetchWeatherRecommendations>;

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
    const mockPlanData = {
      message: 'success',
      planFrame: {
        planId: 123,
        planName: 'Test Trip',
        departure: 'SEOUL',
        travelCategoryName: 'Category',
        travelId: 1,
        travelName: 'Name',
        adultCount: 1,
        childCount: 0,
        transportationCategoryId: 1,
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

    mockFetchWeatherRecommendations.mockImplementationOnce(() => weatherPromise as any);

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
            temp_min: 20,
            temp_max: 30,
            feels_like: 25,
            description: 'Sunny',
          },
        ],
      });
    });

    // Check if isWeatherLoading becomes false after weather promise is resolved
    expect(viewComponent.props.isWeatherLoading).toBe(false);
  });
});
