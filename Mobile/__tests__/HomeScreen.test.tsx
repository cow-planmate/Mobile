import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import HomeScreen from '../src/features/home/screens/HomeScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mocking Navigation
const mockNavigate = jest.fn();
const mockAddListener = jest.fn((event, callback) => {
  return () => {};
});
const mockNavigation = {
  navigate: mockNavigate,
  addListener: mockAddListener,
  setParams: jest.fn(),
} as any;

const mockRoute = {} as any;

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (effect: () => void) => {
      React.useEffect(() => {
        effect();
      }, []);
    },
    useNavigation: () => ({
      goBack: jest.fn(),
      navigate: mockNavigate,
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

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
    withRepeat: (val: any) => val,
    withTiming: (val: any) => val,
    withSpring: (val: any) => val,
    cancelAnimation: () => {},
    runOnJS: (fn: any) => fn,
    interpolate: (value: number, inputRange: number[], outputRange: number[]) => value,
    Extrapolation: {
      CLAMP: 'clamp',
    },
  };
});

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

// Mocking useAuthStore
jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { nickname: 'TestUser', email: 'test@example.com' },
    }),
}));

// Mocking AlertContext
const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

// Mocking Trips APIs
const mockMutateAsync = jest.fn(() => Promise.resolve({ planId: 'new-plan-123' }));
jest.mock('../src/hooks/usePlanQueries', () => ({
  useCreateFullPlan: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

jest.mock('../src/api/trips', () => ({
  getPendingInvitations: jest.fn(() => Promise.resolve([])),
  acceptInvitation: jest.fn(() => Promise.resolve()),
  rejectInvitation: jest.fn(() => Promise.resolve()),
}));

// Mocking FCM & SSE hooks
jest.mock('../src/hooks/useFcmNotifications', () => ({
  useFcmNotifications: jest.fn(),
  IS_FCM_RUNTIME_ENABLED: false,
}));
jest.mock('../src/hooks/useInvitationSse', () => ({
  useInvitationSse: jest.fn(),
}));

// Mocking lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Bus: (props: any) => React.createElement(View, props),
    Car: (props: any) => React.createElement(View, props),
  };
});

// Mocking other native / third-party modules that might be used inside view
jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: ({ children }: any) => React.createElement(View, null, children),
  };
});

describe('HomeScreen - Pre-save Itinerary Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  it('renders correctly and performs flow for itinerary creation', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>
      );
    });

    expect(renderer).toBeDefined();

    const viewComponent = renderer!.root.findByType(require('../src/features/home/screens/HomeScreen.view').HomeScreenView);
    expect(viewComponent).toBeTruthy();

    // 1. Select destination to satisfy validations
    await ReactTestRenderer.act(async () => {
      viewComponent.props.onSelectLocation('제주도', 3);
    });

    // 2. Trigger creation
    await ReactTestRenderer.act(async () => {
      await viewComponent.props.onCreateItinerary();
    });

    // 3. Verify mutateAsync is called and navigate to ItineraryEditor is called with planId
    expect(mockMutateAsync).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      'ItineraryEditor',
      expect.objectContaining({
        planId: 'new-plan-123',
        destination: '제주도',
        travelId: 3,
        departure: 'SEOUL',
      })
    );
  });
});
