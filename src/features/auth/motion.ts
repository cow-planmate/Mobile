import { Easing, FadeInUp } from 'react-native-reanimated';

const REVEAL_STAGGER_MS = 40;
const REVEAL_DURATION_MS = 240;
const REVEAL_EASING = Easing.out(Easing.cubic);

export const PUSH_TRANSITION_MS = 0;

export const revealStep = (order: number, baseDelayMs = 0) =>
  FadeInUp.duration(REVEAL_DURATION_MS)
    .delay(baseDelayMs + order * REVEAL_STAGGER_MS)
    .easing(REVEAL_EASING);
