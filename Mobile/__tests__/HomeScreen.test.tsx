import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import HomeScreen from '../src/features/home/screens/HomeScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { nickname: 'TestUser', email: 'test@example.com' },
    }),
}));

const mockShowAlert = jest.fn();
jest.mock('../src/contexts/AlertContext', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

const mockMutateAsync = jest.fn<Promise<{ planId?: string }>, []>(() =>
  Promise.resolve({ planId: 'new-plan-123' }),
);
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

jest.mock('../src/hooks/useFcmNotifications', () => ({
  useFcmNotifications: jest.fn(),
  IS_FCM_RUNTIME_ENABLED: false,
}));
jest.mock('../src/hooks/useInvitationSse', () => ({
  useInvitationSse: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Bus: (props: any) => React.createElement(View, props),
    Car: (props: any) => React.createElement(View, props),
  };
});

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: () => null,
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

describe('HomeScreen - Pre-save Itinerary Flow', () => {
  let queryClient: QueryClient;
  const mountedRenderers: ReactTestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    ReactTestRenderer.act(() => {
      mountedRenderers.splice(0).forEach(renderer => renderer.unmount());
    });
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.useFakeTimers();
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
      mountedRenderers.push(renderer!);
    });

    expect(renderer).toBeDefined();

    const viewComponent = renderer!.root.findByType(require('../src/features/home/screens/HomeScreen.view').HomeScreenView);
    expect(viewComponent).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      viewComponent.props.onSelectLocation('제주도', 3);
    });

    await ReactTestRenderer.act(async () => {
      await viewComponent.props.onCreateItinerary();
    });

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

  it('does not navigate when the create response has no plan id', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const viewComponent = renderer!.root.findByType(
      require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
    );
    await ReactTestRenderer.act(async () => {
      viewComponent.props.onSelectLocation('Seoul', 3);
    });
    await ReactTestRenderer.act(async () => {
      await viewComponent.props.onCreateItinerary();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: '일정을 확인할 수 없습니다' }),
    );
  });

  it('연타해도 일정을 한 번만 생성한다', async () => {
    let resolveCreate: (value: { planId?: string }) => void = () => {};
    mockMutateAsync.mockImplementationOnce(
      () =>
        new Promise<{ planId?: string }>(resolve => {
          resolveCreate = resolve;
        }),
    );

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const viewComponent = renderer!.root.findByType(
      require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
    );
    await ReactTestRenderer.act(async () => {
      viewComponent.props.onSelectLocation('제주도', 3);
    });

    // 첫 요청이 아직 끝나지 않은 사이에 같은 프레임에서 한 번 더 누른 상황.
    const first = viewComponent.props.onCreateItinerary();
    const second = viewComponent.props.onCreateItinerary();

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      resolveCreate({ planId: 'new-plan-123' });
      await Promise.all([first, second]);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });
});
