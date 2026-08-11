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

/**
 * AuthStack의 화면 전환(slide_from_right) 지속시간과 같다.
 * push로 들어오는 화면은 이 시간만큼 기다렸다가 콘텐츠를 띄워, 화면 슬라이드와
 * 콘텐츠 등장이 같은 순간 겹치지 않고 하나의 시퀀스로 이어지게 한다.
 */
export const PUSH_TRANSITION_MS = 250;

export const revealStep = (order: number, baseDelayMs = 0) =>
  FadeInUp.duration(REVEAL_DURATION_MS)
    .delay(baseDelayMs + order * REVEAL_STAGGER_MS)
    .easing(REVEAL_EASING);
