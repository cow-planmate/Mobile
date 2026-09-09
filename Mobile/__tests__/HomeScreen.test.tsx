import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import HomeScreen from '../src/features/home/screens/HomeScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { useFcmNotifications } from '../src/hooks/useFcmNotifications';
import { useInvitationSse } from '../src/hooks/useInvitationSse';
import { OWNED_PLAN_IDS_QUERY_KEY } from '../src/hooks/usePlanOwnership';
import { PENDING_INVITATIONS_QUERY_KEY } from '../src/hooks/usePendingInvitations';
import { acceptInvitation, rejectInvitation } from '../src/api/trips';

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
    SafeAreaProvider: ({ children }: any) =>
      React.createElement(View, null, children),
    SafeAreaView: ({ children }: any) =>
      React.createElement(View, null, children),
    useSafeAreaInsets: () => inset,
  };
});

// 세 입력이 모두 비어서 시작하므로 생성 전에 기간과 인원까지 채워야 한다.
const fillPeriodAndPax = async (viewComponent: any) => {
  await ReactTestRenderer.act(async () => {
    viewComponent.props.onConfirmCalendar({
      startDate: new Date(2026, 8, 12),
      endDate: new Date(2026, 8, 14),
    });
    viewComponent.props.onConfirmPax({ adults: 2, children: 0 });
  });
};

describe('HomeScreen - Pre-save Itinerary Flow', () => {
  let queryClient: QueryClient;
  const mountedRenderers: ReactTestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    ReactTestRenderer.act(() => {
      mountedRenderers.splice(0).forEach(renderer => renderer.unmount());
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
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

  it('SSE 수신 없이 결과 푸시가 도착해도 편집 권한을 갱신한다', async () => {
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    await ReactTestRenderer.act(async () => {
      mountedRenderers.push(
        ReactTestRenderer.create(
          <QueryClientProvider client={queryClient}>
            <HomeScreen navigation={mockNavigation} route={mockRoute} />
          </QueryClientProvider>,
        ),
      );
    });
    const calls = (useFcmNotifications as jest.Mock).mock.calls;
    await ReactTestRenderer.act(async () => {
      await calls[calls.length - 1][0].onInvitationPush('arrived', 'result');
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('SSE 재연결 시 누락된 수락 결과를 권한 재조회로 복구한다', async () => {
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    await ReactTestRenderer.act(async () => {
      mountedRenderers.push(
        ReactTestRenderer.create(
          <QueryClientProvider client={queryClient}>
            <HomeScreen navigation={mockNavigation} route={mockRoute} />
          </QueryClientProvider>,
        ),
      );
    });
    const calls = (useInvitationSse as jest.Mock).mock.calls;
    await ReactTestRenderer.act(async () => {
      await calls[calls.length - 1][0].onConnected();
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    });
  });

  it('백그라운드에서 놓친 수락 결과를 복귀 시 권한 재조회로 복구한다', async () => {
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const listeners = new Set<(state: any) => void>();
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, listener) => {
        listeners.add(listener);
        return { remove: () => listeners.delete(listener) };
      });
    await ReactTestRenderer.act(async () => {
      mountedRenderers.push(
        ReactTestRenderer.create(
          <QueryClientProvider client={queryClient}>
            <HomeScreen navigation={mockNavigation} route={mockRoute} />
          </QueryClientProvider>,
        ),
      );
    });
    await ReactTestRenderer.act(async () => {
      [...listeners].forEach(listener => listener('background'));
    });
    await ReactTestRenderer.act(async () => {
      [...listeners].forEach(listener => listener('active'));
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: OWNED_PLAN_IDS_QUERY_KEY,
    });
  });

  it.each(['accept', 'reject'])(
    '다른 기기에서 처리한 요청의 %s 응답은 재시도 대신 목록과 권한을 갱신한다',
    async action => {
      queryClient.setQueryData(PENDING_INVITATIONS_QUERY_KEY, [
        {
          requestId: 1,
          senderNickname: '동료',
          planName: '여행',
          type: 'INVITE',
        },
      ]);
      const request = action === 'accept' ? acceptInvitation : rejectInvitation;
      (request as jest.Mock).mockRejectedValueOnce({
        response: { data: { code: 'COLLAB_005' } },
      });
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
      let tree: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        tree = ReactTestRenderer.create(
          <QueryClientProvider client={queryClient}>
            <HomeScreen navigation={mockNavigation} route={mockRoute} />
          </QueryClientProvider>,
        );
        mountedRenderers.push(tree);
      });
      const view = tree!.root.findByType(
        require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
      );
      await ReactTestRenderer.act(async () => {
        if (action === 'accept') {
          await view.props.onAcceptNotification(1);
        } else {
          view.props.onRejectNotification(1);
          mockShowAlert.mock.calls[
            mockShowAlert.mock.calls.length - 1
          ][0].buttons[1].onPress();
        }
      });
      expect(queryClient.getQueryData(PENDING_INVITATIONS_QUERY_KEY)).toEqual(
        [],
      );
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: OWNED_PLAN_IDS_QUERY_KEY,
      });
      expect(mockShowAlert).toHaveBeenLastCalledWith(
        expect.objectContaining({ title: '이미 처리된 요청' }),
      );
    },
  );

  it('renders correctly and performs flow for itinerary creation', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    expect(renderer).toBeDefined();

    const viewComponent = renderer!.root.findByType(
      require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
    );
    expect(viewComponent).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      viewComponent.props.onSelectLocation('제주도', 3);
    });

    await fillPeriodAndPax(viewComponent);

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
      }),
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

    await fillPeriodAndPax(viewComponent);
    await ReactTestRenderer.act(async () => {
      await viewComponent.props.onCreateItinerary();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: '일정을 확인할 수 없어요' }),
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

    await fillPeriodAndPax(viewComponent);

    // 첫 요청이 아직 끝나지 않은 사이에 같은 프레임에서 한 번 더 누른 상황.
    let first: Promise<unknown>;
    let second: Promise<unknown>;
    await ReactTestRenderer.act(async () => {
      first = viewComponent.props.onCreateItinerary();
      second = viewComponent.props.onCreateItinerary();
      resolveCreate({ planId: 'new-plan-123' });
      await Promise.all([first!, second!]);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('세 입력 모두 비어서 시작한다', async () => {
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

    expect(viewComponent.props.destination).toBe('');
    expect(viewComponent.props.dateText).toBe('');
    expect(viewComponent.props.paxText).toBe('');
    expect(viewComponent.props.startDate).toBeNull();
    expect(viewComponent.props.adults).toBeNull();
    expect(viewComponent.props.isFormValid).toBe(false);
  });

  it('완료를 누르면 여행지에서 기간으로, 기간에서 인원으로 넘어간다', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const view = () =>
      renderer!.root.findByType(
        require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
      );

    await ReactTestRenderer.act(async () => {
      view().props.onSelectLocation('제주도', 3);
      view().props.onCloseSearchModal();
      view().props.onDoneSearchModal();
    });

    // 시트가 닫히는 동안은 아직 열리지 않는다.
    expect(view().props.isCalendarVisible).toBe(false);

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(view().props.isCalendarVisible).toBe(true);

    await ReactTestRenderer.act(async () => {
      view().props.onCloseCalendar();
      view().props.onDoneCalendar();
      jest.advanceTimersByTime(300);
    });
    expect(view().props.isPaxModalVisible).toBe(true);
  });

  it('renders InputRow with isLast on Pax Count and sets activeOpacity on submit button', async () => {
    const { TouchableOpacity } = require('react-native');
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const touchables = renderer!.root.findAllByType(TouchableOpacity);
    const submitBtn = touchables.find(
      t => t.props.accessibilityLabel === '나만의 일정 만들기',
    );
    expect(submitBtn).toBeDefined();
    expect(submitBtn!.props.activeOpacity).toBe(0.8);

    const paxRow = touchables.find(
      t =>
        t.props.accessibilityLabel &&
        t.props.accessibilityLabel.startsWith('함께하는 인원'),
    );
    expect(paxRow).toBeDefined();
  });

  it('명소 사진을 누르면 해당 지역이 여행지로 자동 선택된다', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const view = () =>
      renderer!.root.findByType(
        require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
      );
    expect(view().props.destination).toBe('');

    await ReactTestRenderer.act(async () => {
      view().props.onSelectSpot({
        place: '경포호',
        roman: 'Gyeongpo Lake',
        region: '강릉',
        image: { uri: 'test' },
      });
    });

    expect(view().props.destination).toBe('강릉');
  });

  it('여행지 선택 전에는 이곳으로 일정 만들기 태그가 노출되고, 선택 후에는 노출되지 않는다', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </QueryClientProvider>,
      );
      mountedRenderers.push(renderer!);
    });

    const view = () =>
      renderer!.root.findByType(
        require('../src/features/home/screens/HomeScreen.view').HomeScreenView,
      );

    // 여행지 선택 전: 태그 존재
    let tags = renderer!.root.findAllByProps({
      children: '이곳으로 일정 만들기',
    });
    expect(tags.length).toBeGreaterThan(0);

    // 여행지 선택: 강릉 선택
    await ReactTestRenderer.act(async () => {
      view().props.onSelectSpot({
        place: '경포호',
        roman: 'Gyeongpo Lake',
        region: '강릉',
        image: { uri: 'test' },
      });
    });

    // 여행지 선택 후: 태그 제거됨
    tags = renderer!.root.findAllByProps({
      children: '이곳으로 일정 만들기',
    });
    expect(tags.length).toBe(0);
  });
});
