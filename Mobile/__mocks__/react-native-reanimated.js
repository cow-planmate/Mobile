/**
 * react-native-reanimated 공용 목.
 *
 * 패키지가 제공하는 mock.js는 이 설치본에서 깨져 있고, 테스트 파일마다 목을
 * 따로 적다 보니 FadeIn·SlideInDown 같은 레이아웃 애니메이션이 빠져 있었다.
 * 알려진 API는 그대로 두고, 모르는 이름은 체이닝만 되는 빌더로 돌려준다.
 * FadeIn.duration(220).easing(...) 같은 호출이 이름을 몰라도 통과한다.
 */
const React = require('react');
const RN = require('react-native');

const createAnimatedComponent = Component => Component;

// Animated.View / Animated.Text / Animated.ScrollView 는 같은 이름의 RN 컴포넌트로 넘긴다.
const animatedHosts = new Proxy(
  { createAnimatedComponent },
  {
    get: (target, key) =>
      key in target ? target[key] : RN[key] ?? RN.View,
  },
);

const identity = value => value;
const easingFn = value => value;

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

const api = {
  __esModule: true,
  default: animatedHosts,
  createAnimatedComponent,
  View: RN.View,
  Easing,
  useSharedValue: value => ({ value }),
  useAnimatedStyle: fn => fn(),
  useDerivedValue: fn => ({ value: fn() }),
  useAnimatedScrollHandler: () => () => {},
  useAnimatedRef: () => ({ current: null }),
  withTiming: identity,
  withSpring: identity,
  withDelay: (_delay, value) => value,
  withSequence: (...values) => values[values.length - 1],
  withRepeat: identity,
  cancelAnimation: () => {},
  runOnJS: fn => fn,
  runOnUI: fn => fn,
  interpolate: value => value,
  interpolateColor: (_value, _input, output) => output[0],
  Extrapolation: { CLAMP: 'clamp' },
  Extrapolate: { CLAMP: 'clamp' },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
};

// FadeInUp.duration().delay().easing() 처럼 이어 붙는 호출을 모두 받아낸다.
const builder = new Proxy(
  {},
  { get: () => () => builder, apply: () => builder },
);

module.exports = new Proxy(api, {
  get: (target, key) => (key in target ? target[key] : builder),
});

// React를 참조해 두어야 번들러가 JSX 런타임을 떨어뜨리지 않는다.
void React;
