import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import CoachmarkOverlay from './CoachmarkOverlay';
import { useCoachmarkRegistry, useCoachmarkTour } from './CoachmarkContext';
import { EDITOR_COACHMARK_STEPS, type CoachmarkStep } from './coachmarkSteps';
import {
  holeRect,
  isInside,
  isRectVisible,
  measureTarget,
  type CoachmarkRect,
} from './measureTarget';

/**
 * 짚어 준 것을 누르고 나서 다음으로 넘어가기까지 두는 틈(ms).
 *
 * 곧바로 넘기면 누른 것이 눈에 보이기도 전에 말풍선이 옮겨 가 '내가 눌러서
 * 넘어갔다'는 것이 남지 않는다.
 */
const ADVANCE_DELAY_MS = 250;

interface EditorCoachmarkProps {
  /**
   * 안내를 그려도 되는 상태인지. 모달이 떠 있거나 아직 일정을 불러오는 중이면
   * 짚을 자리가 가려져 있어, 그 사이에 열면 잴 수 있을 때까지 기다린다.
   */
  enabled: boolean;
}

/**
 * 일정 편집 화면의 버튼을 하나씩 짚어 준다.
 *
 * 스스로 뜨지 않는다 - 물음표 단추(TutorialLauncher)를 눌러야 시작한다.
 * 시작할 때 열세 자리를 한 번에 재서 짚을 수 있는 것만 추려 둔다. 여기서 추린
 * 목록은 끝까지 그대로 두어 '6 / 13'이 도중에 흔들리지 않게 한다.
 *
 * 좌표는 목록과 달리 매번 다시 잰다. 이제 안내 중에도 화면을 만질 수 있어서
 * 일차를 바꾸거나 장소 패널을 올리면 처음 잰 자리가 엉뚱한 곳을 가리킨다.
 * 지금 짚을 것 하나만 다시 재고, 그사이 사라졌으면 그 단계는 건너뛴다.
 */
export default function EditorCoachmark({ enabled }: EditorCoachmarkProps) {
  const registry = useCoachmarkRegistry();
  const tour = useCoachmarkTour();
  const { width, height } = useWindowDimensions();

  const [plan, setPlan] = useState<CoachmarkStep[] | null>(null);
  const [index, setIndex] = useState(0);
  // 지금 짚고 있는 자리. 가려져 있는 동안에는 비운다 - 그동안 안내는 숨는다.
  const [rect, setRect] = useState<CoachmarkRect | null>(null);

  const isRunning = !!tour?.isRunning;
  const closeTour = tour?.closeTour;
  const watchTouch = tour?.watchTouch;

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current === null) return;
    clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }, []);

  useEffect(() => {
    // 닫히면 추려 둔 목록을 버린다. 다음에 열 때 그 시점의 화면을 새로 잰다.
    if (!isRunning) {
      clearAdvance();
      setPlan(null);
      setIndex(0);
      setRect(null);
      return;
    }
    if (plan || !enabled) return;

    let alive = true;
    Promise.all(
      EDITOR_COACHMARK_STEPS.map(step =>
        measureTarget(registry?.resolve(step.target) ?? null).then(
          measured => ({
            step,
            rect: measured,
          }),
        ),
      ),
    ).then(measured => {
      if (!alive) return;

      const planned = measured
        .filter(entry => entry.rect && isRectVisible(entry.rect, width, height))
        .map(entry => entry.step);

      // 하나도 재지 못했으면 빈 안내를 띄우는 대신 조용히 닫는다.
      // 단추는 그대로 있으니 다시 누르면 된다.
      if (planned.length === 0) {
        closeTour?.();
        return;
      }

      setPlan(planned);
      setIndex(0);
    });

    return () => {
      alive = false;
    };
  }, [
    isRunning,
    plan,
    enabled,
    registry,
    width,
    height,
    closeTour,
    clearAdvance,
  ]);

  const step = plan?.[index] ?? null;

  /**
   * 지금 짚을 자리를 그릴 때마다 다시 잰다. 모달이 덮고 있는 동안에는 비워
   * 두었다가, 모달이 닫히면 그 자리를 새로 재서 이어 간다.
   */
  useEffect(() => {
    if (!isRunning || !plan || !step) return;
    if (!enabled) {
      setRect(null);
      return;
    }

    let alive = true;
    measureTarget(registry?.resolve(step.target) ?? null).then(measured => {
      if (!alive) return;
      if (measured && isRectVisible(measured, width, height)) {
        setRect(measured);
        return;
      }
      // 사라진 자리는 짚을 수 없다. 마지막이었으면 여기서 끝낸다.
      setRect(null);
      if (index >= plan.length - 1) {
        closeTour?.();
        return;
      }
      setIndex(index + 1);
    });

    return () => {
      alive = false;
    };
  }, [
    isRunning,
    plan,
    step,
    index,
    enabled,
    registry,
    width,
    height,
    closeTour,
  ]);

  const finish = useCallback(() => {
    clearAdvance();
    closeTour?.();
  }, [clearAdvance, closeTour]);

  const handleNext = useCallback(() => {
    clearAdvance();
    if (!plan) return;
    if (index >= plan.length - 1) {
      finish();
      return;
    }
    setIndex(index + 1);
  }, [plan, index, finish, clearAdvance]);

  /**
   * 짚어 준 것을 직접 눌렀으면 넘어간다.
   *
   * 손가락이 떨어질 때 판정한다 - 닿는 순간에 넘기면 시간표 블록을 끌기
   * 시작하자마자 그 자리가 벽으로 덮여 끌던 손이 끊긴다.
   */
  useEffect(() => {
    if (!isRunning || !watchTouch || !step || !rect) return;
    if (step.interactive === false) return;

    const hole = holeRect(step, rect);
    return watchTouch((x, y) => {
      if (advanceTimer.current !== null) return;
      if (!isInside(hole, x, y)) return;
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        handleNext();
      }, ADVANCE_DELAY_MS);
    });
  }, [isRunning, watchTouch, step, rect, handleNext]);

  /** Modal이 대신 받아 주던 안드로이드 뒤로가기. 이제 직접 받는다. */
  useEffect(() => {
    if (!isRunning) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        finish();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isRunning, finish]);

  useEffect(() => clearAdvance, [clearAdvance]);

  if (!isRunning || !plan || !step || !rect) return null;

  return (
    <CoachmarkOverlay
      step={step}
      index={index}
      total={plan.length}
      rect={rect}
      onNext={handleNext}
      onSkip={finish}
    />
  );
}
