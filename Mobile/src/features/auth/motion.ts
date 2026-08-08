import { Easing, FadeInUp } from 'react-native-reanimated';

/**
 * 인증 화면들의 공통 등장 리듬.
 *
 * Intro·Login·Signup이 각자 다른 신호로 움직이지 않도록 값을 한 곳에
 * 묶는다. order만 다르게 주면 스태거가 된다.
 */
const REVEAL_STAGGER_MS = 90;
const REVEAL_DURATION_MS = 420;
const REVEAL_EASING = Easing.out(Easing.cubic);

export const revealStep = (order: number) =>
  FadeInUp.duration(REVEAL_DURATION_MS)
    .delay(order * REVEAL_STAGGER_MS)
    .easing(REVEAL_EASING);
