import React, { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EDITOR_COACHMARK_KEY } from '../../../constants/storageKeys';
import CoachmarkOverlay from './CoachmarkOverlay';
import { useCoachmarkRegistry } from './CoachmarkContext';
import { EDITOR_COACHMARK_STEPS, type CoachmarkStep } from './coachmarkSteps';
import {
  isRectVisible,
  measureTarget,
  type CoachmarkRect,
} from './measureTarget';

/**
 * 화면이 자리를 잡기 전에 재면 좌표가 어긋난다. 일정을 받아 그리고 하단 패널이
 * 제자리에 앉을 틈을 준다.
 */
const START_DELAY_MS = 600;

type Phase = 'checking' | 'waiting' | 'running' | 'done';

interface PlannedStep {
  step: CoachmarkStep;
  rect: CoachmarkRect;
}

interface EditorCoachmarkProps {
  /**
   * 안내를 시작해도 되는 상태인지. 모달이 떠 있거나 아직 일정을 불러오는 중이면
   * 내려 두고, 다음에 이 화면에 들어올 때 다시 시도한다.
   */
  enabled: boolean;
}

/**
 * 일정 편집 화면에 처음 들어온 사람에게 버튼을 하나씩 짚어 준다.
 *
 * 시작할 때 열세 자리를 한 번에 재서 짚을 수 있는 것만 추려 둔다. 스텝마다 새로
 * 재면 못 재는 것을 만날 때마다 번호가 건너뛰어 '6 / 13'이 영영 나오지 않는다.
 * 안내가 떠 있는 동안에는 화면을 만질 수 없으므로 좌표가 도중에 변할 일도 없다.
 */
export default function EditorCoachmark({ enabled }: EditorCoachmarkProps) {
  const registry = useCoachmarkRegistry();
  const { width, height } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('checking');
  const [plan, setPlan] = useState<PlannedStep[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(EDITOR_COACHMARK_KEY)
      .then(seen => {
        if (alive) setPhase(seen ? 'done' : 'waiting');
      })
      // 저장소를 못 읽으면 조용히 넘긴다. 안내 하나 때문에 화면을 막을 수는 없다.
      .catch(() => {
        if (alive) setPhase('done');
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'waiting' || !enabled) return;

    let alive = true;
    const timer = setTimeout(() => {
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

        // 하나도 재지 못했으면 봤다고 치지 않는다. 다음 진입에 다시 시도한다.
        if (planned.length === 0) {
          setPhase('done');
          return;
        }

        setPlan(planned);
        setIndex(0);
        setPhase('running');
      });
    }, START_DELAY_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [phase, enabled, registry, width, height]);

  const finish = useCallback(() => {
    setPhase('done');
    setPlan(null);
    AsyncStorage.setItem(EDITOR_COACHMARK_KEY, '1').catch(() => {});
  }, []);

  const handleNext = useCallback(() => {
    if (!plan) return;
    if (index >= plan.length - 1) {
      finish();
      return;
    }
    setIndex(index + 1);
  }, [plan, index, finish]);

  if (phase !== 'running' || !plan) return null;

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
