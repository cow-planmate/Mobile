import React from 'react';
import { Modal } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from '../src/contexts/AlertContext';
import { PlacesProvider } from '../src/contexts/PlacesContext';

// 실기기 스토리북은 NavigationContainer 안에서 돌지만, 테스트에서는 훅만 대체한다
jest.mock('@react-navigation/native', () => {
  const React2 = require('react');
  return {
    NavigationContainer: ({ children }: any) => children,
    useFocusEffect: (effect: () => void) => {
      React2.useEffect(() => {
        effect();
      }, []);
    },
    useNavigation: () => ({
      goBack: jest.fn(),
      navigate: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useIsFocused: () => true,
  };
});

// 제스처는 네이티브 모듈이 필요하다 — 빌더 체이닝을 그대로 흘려보내는 스텁으로 대체한다
jest.mock('react-native-gesture-handler', () => {
  const React2 = require('react');
  const { View, ScrollView, TouchableOpacity } = require('react-native');
  const chainable: any = new Proxy(() => chainable, {
    get: () => () => chainable,
    apply: () => chainable,
  });
  const passthrough = ({ children, ...rest }: any) =>
    React2.createElement(View, rest, children);
  return {
    GestureHandlerRootView: passthrough,
    GestureDetector: passthrough,
    PanGestureHandler: passthrough,
    TapGestureHandler: passthrough,
    LongPressGestureHandler: passthrough,
    ScrollView,
    TouchableOpacity,
    State: {},
    Directions: {},
    Gesture: new Proxy({}, { get: () => () => chainable }),
  };
});

// 상단 탭 내비게이터는 ESM만 배포한다 — 모든 탭 화면을 한 번에 렌더해 검증한다
jest.mock('@react-navigation/material-top-tabs', () => {
  const React2 = require('react');
  const { View } = require('react-native');
  return {
    createMaterialTopTabNavigator: () => ({
      Navigator: ({ children }: any) =>
        React2.createElement(View, { testID: 'mock-top-tab-navigator' }, children),
      Screen: ({ name, children, component }: any) =>
        React2.createElement(
          View,
          { testID: `mock-tab-screen-${name}` },
          typeof children === 'function'
            ? children()
            : component
              ? React2.createElement(component)
              : null,
        ),
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// 스토리 렌더 검증에서 실제 백엔드 요청이 열린 핸들로 남지 않게 한다.
jest.mock('axios', () => {
  const request = jest.fn().mockResolvedValue({ data: {} });
  Object.assign(request, {
    defaults: { headers: { common: {} } },
    delete: jest.fn().mockResolvedValue({ data: {} }),
    get: jest.fn().mockResolvedValue({ data: { destinations: [] } }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    isAxiosError: jest.fn(() => false),
    isCancel: jest.fn(() => false),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
  });
  return { __esModule: true, default: request };
});

// storybook/actions는 ESM만 배포한다 — 테스트에서는 호출만 기록한다
jest.mock('storybook/actions', () => ({
  action: (name: string) => jest.fn().mockName(name),
}));

jest.mock('react-native-reanimated', () => {
  const React2 = require('react');
  const RN = require('react-native');
  const createAnimatedComponent = (Component: any) => Component;
  const View = RN.View;
  // Animated.View / Animated.Text / Animated.ScrollView ... 를 대응하는 RN 컴포넌트로 넘긴다
  const animatedHosts: any = new Proxy(
    { createAnimatedComponent },
    {
      get: (target: any, key: string) =>
        key in target ? target[key] : (RN as any)[key] ?? RN.View,
    },
  );
  const identity = (value: any) => value;
  const easingFn = (value: any) => value;
  const Easing = {
    ease: easingFn,
    linear: easingFn,
    quad: easingFn,
    cubic: easingFn,
    in: () => easingFn,
    out: () => easingFn,
    inOut: () => easingFn,
    bezier: () => ({ factory: () => easingFn }),
  };
  const api: any = {
    __esModule: true,
    default: animatedHosts,
    createAnimatedComponent,
    View,
    Easing,
    useSharedValue: (value: any) => ({ value }),
    useAnimatedStyle: (fn: any) => fn(),
    useDerivedValue: (fn: any) => ({ value: fn() }),
    useAnimatedScrollHandler: () => () => {},
    useAnimatedRef: () => ({ current: null }),
    withTiming: identity,
    withSpring: identity,
    withDelay: (_delay: number, value: any) => value,
    withSequence: (...values: any[]) => values[values.length - 1],
    withRepeat: identity,
    cancelAnimation: () => {},
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
    interpolate: (value: number) => value,
    interpolateColor: (_value: number, _input: number[], output: string[]) =>
      output[0],
    Extrapolation: { CLAMP: 'clamp' },
    Extrapolate: { CLAMP: 'clamp' },
  };

  // FadeInUp.duration().delay().easing() 같은 진입 애니메이션 빌더는
  // 이름이 많아 개별로 흉내내지 않고 체이닝만 통과시킨다
  const builder: any = new Proxy(
    {},
    { get: () => () => builder, apply: () => builder },
  );

  return new Proxy(api, {
    get: (target: any, key: string) => (key in target ? target[key] : builder),
  });
});

jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  const React2 = require('react');
  return {
    FlashList: ({
      data,
      renderItem,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
    }: any) =>
      React2.createElement(
        View,
        { testID: 'mock-flash-list' },
        typeof ListHeaderComponent === 'function'
          ? ListHeaderComponent()
          : ListHeaderComponent,
        data && data.length > 0
          ? data.map((item: any, index: number) =>
              React2.cloneElement(renderItem({ item, index }), {
                key: item.id ?? String(index),
              }),
            )
          : typeof ListEmptyComponent === 'function'
            ? ListEmptyComponent()
            : ListEmptyComponent,
        typeof ListFooterComponent === 'function'
          ? ListFooterComponent()
          : ListFooterComponent,
      ),
  };
});

// 마이페이지 스토리가 실제 서버를 때리지 않도록 활동 목록 훅만 고정 데이터로 바꾼다
jest.mock('../src/features/community/hooks/queries', () => {
  const actual = jest.requireActual('../src/features/community/hooks/queries');
  const page = (items: any[]) => ({
    data: { items, page: 0, size: items.length, totalElements: items.length, totalPages: 1 },
    isLoading: false,
    isError: false,
  });
  return {
    ...actual,
    useMyPosts: () => page([]),
    useLikedPosts: () => page([]),
    useMyComments: () => page([]),
  };
});

// 지도/경로 스토리가 실제 서버를 때리지 않도록 경로 API는 빈 응답으로 고정한다
jest.mock('../src/api/route', () => ({
  fetchDirections: jest.fn(async () => ({ points: [], fallback: true })),
  fetchRouteTable: jest.fn(async () => ({ durations: [], distances: [] })),
  fetchRouteTrip: jest.fn(async () => ({ legs: [] })),
  fetchTransit: jest.fn(async () => ({ options: [] })),
  fetchTransitLane: jest.fn(async () => ({ points: [] })),
  isRouteFallback: () => true,
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { WebView: View };
});

const storyModules: Record<string, any> = {
  '01. 공통/01. UI 프리미티브': require('../src/components/ui/UiPrimitives.stories'),
  '02. 시작 및 인증/01. 인트로': require('../src/features/auth/screens/Intro.stories'),
  '02. 시작 및 인증/02. 로그인': require('../src/features/auth/screens/Login.stories'),
  '02. 시작 및 인증/03. 회원가입': require('../src/features/auth/screens/Signup.stories'),
  '02. 시작 및 인증/05. 비밀번호 찾기': require('../src/features/auth/screens/ForgotPassword.stories'),
  '02. 시작 및 인증/06. 비밀번호 변경': require('../src/features/auth/screens/ChangePassword.stories'),
  '02. 시작 및 인증/04. 소셜 가입 추가정보': require('../src/features/auth/screens/OAuthAdditionalInfo.stories'),
  '06. 마이페이지/01. 프로필': require('../src/features/auth/screens/Profile.stories'),
  '03. 홈/01. 일정 생성': require('../src/features/home/screens/Home.stories'),
  '05. 커뮤니티/01. 게시판': require('../src/features/community/screens/Community.stories'),
  '04. 일정/02. 일정 완성': require('../src/features/itinerary/screens/ItineraryView.stories'),
  '04. 일정/01. 일정 편집': require('../src/features/itinerary/screens/ItineraryEditor.stories'),
  '04. 일정/03. 일정 편집 모달': require('../src/features/itinerary/components/ItineraryModals.stories'),
};

/** .rnstorybook/preview.tsx의 데코레이터와 같은 프로바이더 구성 */
function StoryWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <PlacesProvider>{children}</PlacesProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}

const isStory = (value: any) =>
  !!value && typeof value === 'object' && !Array.isArray(value);

describe('Storybook 스토리 렌더링', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  Object.entries(storyModules).forEach(([title, mod]) => {
    const meta = mod.default;
    const stories = Object.entries(mod).filter(
      ([name, value]) => name !== 'default' && isStory(value),
    );

    it(`${title} — meta 제목이 일치한다`, () => {
      expect(meta.title).toBe(title);
      expect(stories.length).toBeGreaterThan(0);
    });

    stories.forEach(([name, story]: [string, any]) => {
      it(`${title} · ${name} 렌더링`, async () => {
        expect(story.name).toMatch(/[가-힣]/);

        let tree: renderer.ReactTestRenderer | undefined;

        await act(async () => {
          tree = renderer.create(
            <StoryWrapper>
              {story.render
                ? story.render()
                : React.createElement(meta.component, {
                    ...meta.args,
                    ...story.args,
                  })}
            </StoryWrapper>,
          );
        });

        expect(tree!.toJSON()).toBeTruthy();

        // 스스로 걷히는 로딩 오버레이는 통과시킨다
        await act(async () => {
          jest.advanceTimersByTime(3000);
        });

        // 불투명 전체화면 모달이 계속 떠 있으면 스토리북 UI를 덮어
        // 다른 스토리를 고를 수 없게 된다. 모달 안에 닫기 수단이 있는 스토리만
        // parameters.dismissibleFullScreenModal로 예외 처리한다.
        if (!story.parameters?.dismissibleFullScreenModal) {
          const blockingModals = tree!.root
            .findAllByType(Modal)
            .filter(
              node => node.props.visible && node.props.transparent !== true,
            );
          expect(blockingModals).toHaveLength(0);
        }

        await act(async () => {
          tree!.unmount();
        });
      });
    });
  });
});
