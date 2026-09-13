import React, { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import CoachmarkOverlay from './CoachmarkOverlay';
import { useCoachmarkRegistry, useCoachmarkTour } from './CoachmarkContext';
import { EDITOR_COACHMARK_STEPS, type CoachmarkStep } from './coachmarkSteps';
import {
  isRectVisible,
  measureTarget,
  type CoachmarkRect,
} from './measureTarget';

interface PlannedStep {
  step: CoachmarkStep;
  rect: CoachmarkRect;
}

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
 * 시작할 때 열세 자리를 한 번에 재서 짚을 수 있는 것만 추려 둔다. 스텝마다 새로
 * 재면 못 재는 것을 만날 때마다 번호가 건너뛰어 '6 / 13'이 영영 나오지 않는다.
 * 안내가 떠 있는 동안에는 화면을 만질 수 없으므로 좌표가 도중에 변할 일도 없다.
 */
export default function EditorCoachmark({ enabled }: EditorCoachmarkProps) {
  const registry = useCoachmarkRegistry();
  const tour = useCoachmarkTour();
  const { width, height } = useWindowDimensions();

  const [plan, setPlan] = useState<PlannedStep[] | null>(null);
  const [index, setIndex] = useState(0);

  const isRunning = !!tour?.isRunning;
  const closeTour = tour?.closeTour;

  useEffect(() => {
    // 닫히면 잰 자리를 버린다. 다음에 열 때 그 시점의 화면을 새로 잰다.
    if (!isRunning) {
      setPlan(null);
      setIndex(0);
      return;
    }
    if (plan || !enabled) return;

    let alive = true;
    Promise.all(
      EDITOR_COACHMARK_STEPS.map(step =>
        measureTarget(registry?.resolve(step.target) ?? null).then(rect => ({
          step,
          rect,
        })),
      ),
    ).then(measured => {
      if (!alive) return;

      const planned = measured.filter(
        (entry): entry is PlannedStep =>
          entry.rect !== null && isRectVisible(entry.rect, width, height),
      );

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
  }, [isRunning, plan, enabled, registry, width, height, closeTour]);

  const finish = useCallback(() => {
    closeTour?.();
  }, [closeTour]);

  const handleNext = useCallback(() => {
    if (!plan) return;
    if (index >= plan.length - 1) {
      finish();
      return;
    }
    setIndex(index + 1);
  }, [plan, index, finish]);

  if (!isRunning || !plan) return null;

  const current = plan[index];
  if (!current) return null;

  return (
    <CoachmarkOverlay
      step={current.step}
      index={index}
      total={plan.length}
      rect={current.rect}
      onNext={handleNext}
      onSkip={finish}
    />
  );
}
