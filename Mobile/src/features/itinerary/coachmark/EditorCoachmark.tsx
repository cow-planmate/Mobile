import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import CoachmarkOverlay from './CoachmarkOverlay';
import { useCoachmarkRegistry, useCoachmarkTour } from './CoachmarkContext';
import {
  COACHMARK_PRACTICE_HINT,
  EDITOR_COACHMARK_STEPS,
  type CoachmarkStep,
  type CoachmarkTargetId,
} from './coachmarkSteps';
import {
  holeRect,
  isInside,
  isRectVisible,
  measureTarget,
  toHostRect,
  type CoachmarkRect,
} from './measureTarget';

/**
 * 짚어 준 것을 누르고 나서 다음으로 넘어가기까지 두는 틈(ms).
 *
 * 곧바로 넘기면 누른 것이 눈에 보이기도 전에 말풍선이 옮겨 가 '내가 눌러서
 * 넘어갔다'는 것이 남지 않는다.
 */
const ADVANCE_DELAY_MS = 250;

/**
 * 해봐야 넘어가는 단계를 해낸 뒤 넘어가기까지 두는 틈(ms).
 *
 * 누른 것을 확인시켜 주는 틈보다 길게 둔다 - 장소가 놓이고 시간이 바뀐 결과를
 * 눈으로 한 번 보고 나서 말풍선이 옮겨 가야 '내가 한 것'으로 남는다.
 */
const DONE_ADVANCE_DELAY_MS = 800;

/** 짚을 것을 화면 안으로 끌어와 달라고 한 뒤, 다시 재기까지 기다리는 틈(ms). */
const REVEAL_DELAY_MS = 500;

/**
 * 해봤는지 가려내려고 들여다보는 시간표의 한 줄.
 *
 * 안내가 일정 자료를 통째로 알 필요는 없다. 무엇이 담겼고 언제부터 언제까지인지,
 * 딱 두 가지만 있으면 '장소가 하나 늘었다'와 '있던 것의 시간이 바뀌었다'를 가른다.
 */
export interface CoachmarkPlaceTime {
  id: string;
  startTime: string;
  endTime: string;
}

interface EditorCoachmarkProps {
  /**
   * 안내를 그려도 되는 상태인지. 모달이 떠 있거나 아직 일정을 불러오는 중이면
   * 짚을 자리가 가려져 있어, 그 사이에 열면 잴 수 있을 때까지 기다린다.
   */
  enabled: boolean;
  /**
   * 지금 시간표에 담긴 것들. 직접 해봐야 넘어가는 단계에서 해냈는지를 여기서 읽는다.
   *
   * 담기와 시간 조절은 끌어놓기·손잡이·시간 고르기로 길이 여럿이라 각 자리마다
   * '했다'고 알리는 줄을 심으면 길 하나를 빠뜨렸을 때 안내가 영영 막힌다.
   * 결과만 보면 어느 길로 왔든 똑같이 잡힌다.
   */
  places?: readonly CoachmarkPlaceTime[];
  /**
   * 짚을 것이 화면 밖으로 밀려나 있을 때, 그것을 다시 보이게 해 달라는 부탁.
   *
   * 시간표는 장소를 담으면 담은 자리로 굴러간다. 그러면 안내가 짚으려던 첫
   * 블록이 위로 밀려나 '사라진 것'으로 보여 시간 조절 단계가 통째로 건너뛰였다.
   * 화면 밖으로 나간 것은 아예 재지지도 않으므로, 없어진 것과 구분할 길이
   * 여기 대답뿐이다 - 끌어올 수 있으면 true, 그런 자리가 아니면 false.
   */
  onRevealTarget?: (target: CoachmarkTargetId) => boolean;
}

const EMPTY_PLACES: readonly CoachmarkPlaceTime[] = [];

const timeMap = (places: readonly CoachmarkPlaceTime[]) =>
  new Map(
    places.map(place => [place.id, `${place.startTime}-${place.endTime}`]),
  );

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
export default function EditorCoachmark({
  enabled,
  places = EMPTY_PLACES,
  onRevealTarget,
}: EditorCoachmarkProps) {
  const registry = useCoachmarkRegistry();
  const tour = useCoachmarkTour();
  const { width, height } = useWindowDimensions();

  const [plan, setPlan] = useState<CoachmarkStep[] | null>(null);
  const [index, setIndex] = useState(0);
  // 지금 짚고 있는 자리. 가려져 있는 동안에는 비운다 - 그동안 안내는 숨는다.
  const [rect, setRect] = useState<CoachmarkRect | null>(null);
  // 짚은 것과 함께 밝혀 둘 자리(장소를 놓을 시간표처럼).
  const [extraRect, setExtraRect] = useState<CoachmarkRect | null>(null);
  // 지금 단계에서 권한 일을 해냈는지.
  const [isDone, setIsDone] = useState(false);
  /** 그 단계에 들어설 때의 시간표. 여기서 달라진 것이 있어야 해낸 것이다. */
  const baseline = useRef<{ index: number; times: Map<string, string> } | null>(
    null,
  );
  /** 끌어와 달라고 부탁한 단계. 한 단계에 한 번만 부탁하고, 그래도 안 보이면 건너뛴다. */
  const revealed = useRef<number | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [probe, setProbe] = useState(0);

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
      setExtraRect(null);
      baseline.current = null;
      revealed.current = null;
      setIsDone(false);
      return;
    }
    if (plan || !enabled) return;

    let alive = true;
    // 판도 함께 잰다. 열세 자리를 모두 이 판 기준으로 옮겨 적어야 한다.
    Promise.all([
      measureTarget(registry?.resolveHost() ?? null),
      ...EDITOR_COACHMARK_STEPS.map(step =>
        measureTarget(registry?.resolve(step.target) ?? null),
      ),
    ]).then(([host, ...measured]) => {
      if (!alive) return;

      const planned = EDITOR_COACHMARK_STEPS.filter((_, i) => {
        const local = toHostRect(measured[i], host);
        return local && isRectVisible(local, width, height);
      });

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

    // 단계에 들어설 때 한 번, 짚을 것을 화면 안으로 끌어와 달라고 한다.
    // 재고 나서 판단하지 않는다 - 시간표 밖으로 밀려난 블록은 창 안에 있는
    // 것처럼 잡히지만 실제로는 상단바 뒤에 숨어 있어, 재 봐야 알 수 없다.
    if (revealed.current !== index) {
      revealed.current = index;
      if (onRevealTarget?.(step.target)) {
        setRect(null);
        revealTimer.current = setTimeout(() => {
          revealTimer.current = null;
          setProbe(value => value + 1);
        }, REVEAL_DELAY_MS);
        return;
      }
    }
    // 끌어오는 중에는 재지 않는다. 옮겨 가는 도중의 자리를 짚게 된다.
    if (revealTimer.current !== null) {
      setRect(null);
      return;
    }

    let alive = true;
    Promise.all([
      measureTarget(registry?.resolve(step.target) ?? null),
      measureTarget(registry?.resolveHost() ?? null),
      measureTarget(
        step.lightAlso ? registry?.resolve(step.lightAlso) ?? null : null,
      ),
    ]).then(([measured, host, alsoMeasured]) => {
      if (!alive) return;
      const local = toHostRect(measured, host);
      const also = toHostRect(alsoMeasured, host);
      setExtraRect(also && isRectVisible(also, width, height) ? also : null);
      if (local && isRectVisible(local, width, height)) {
        setRect(local);
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
    onRevealTarget,
    probe,
  ]);

  const practice = step?.practice ?? null;

  /**
   * 해보기를 권한 단계에 들어설 때의 시간표를 적어 두고, 그 뒤로 달라진 것이
   * 있으면 해낸 것으로 친다.
   *
   * 늘어난 줄이 있으면 담은 것이고, 처음부터 있던 줄의 시간이 달라졌으면 시간을
   * 조절한 것이다. 담기와 시간 조절을 이렇게 갈라 놓아야 시간을 조절하라는
   * 단계에서 장소를 하나 더 담는 것으로 넘어가 버리지 않는다.
   */
  useEffect(() => {
    if (!isRunning || !practice) return;

    const current = timeMap(places);
    const base = baseline.current;
    if (!base || base.index !== index) {
      baseline.current = { index, times: current };
      setIsDone(false);
      return;
    }
    if (isDone) return;

    const done =
      practice === 'placeAdded'
        ? [...current.keys()].some(id => !base.times.has(id))
        : [...base.times].some(
            ([id, time]) => current.has(id) && current.get(id) !== time,
          );
    if (done) setIsDone(true);
  }, [isRunning, practice, index, places, isDone]);

  /**
   * 아직 해보지 않았을 때 적어 두는 권유.
   *
   * 할 수 없는 것은 권하지 않는다 - 담긴 장소가 하나도 없으면 바꿀 시간도 없고,
   * 그 자리에는 예시 블록이 대신 떠 있다.
   */
  const practiceHint =
    practice && !isDone && (practice === 'placeAdded' || places.length > 0)
      ? COACHMARK_PRACTICE_HINT[practice]
      : null;

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

  /** 놓친 것을 다시 보러 돌아간다. 첫 단계에서는 돌아갈 곳이 없다. */
  const handlePrev = useCallback(() => {
    clearAdvance();
    if (index <= 0) return;
    setIndex(index - 1);
  }, [index, clearAdvance]);

  /**
   * 해냈으면 알아서 넘어간다. 한 번 더 '다음'을 누르게 하면 방금 한 것이
   * 무엇이었는지 흐려진다.
   */
  useEffect(() => {
    if (!isRunning || !practice || !isDone) return;
    const timer = setTimeout(handleNext, DONE_ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isRunning, practice, isDone, handleNext]);

  /**
   * 짚어 준 것을 직접 눌렀으면 넘어간다.
   *
   * 손가락이 떨어질 때 판정한다 - 닿는 순간에 넘기면 시간표 블록을 끌기
   * 시작하자마자 그 자리가 벽으로 덮여 끌던 손이 끊긴다.
   */
  useEffect(() => {
    if (!isRunning || !watchTouch || !step || !rect) return;
    if (step.interactive === false) return;
    // 해보기를 권한 단계는 짚은 자리를 눌렀다고 넘어가지 않는다 - 패널을
    // 한 번 건드린 것과 장소를 담은 것은 다르다. 넘어가려면 '다음'을 쓴다.
    if (practice) return;
    // 시간·장소 정보 버튼을 자유롭게 눌러볼 수 있도록 수동 다음으로 넘긴다.
    if (step.target === 'blockActions') return;

    const hole = holeRect(step, rect);
    return watchTouch((x, y) => {
      if (advanceTimer.current !== null) return;
      if (!isInside(hole, x, y)) return;
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        handleNext();
      }, ADVANCE_DELAY_MS);
    });
  }, [isRunning, watchTouch, step, rect, handleNext, practice]);

  /**
   * 지금 짚는 것이 무엇인지 알린다. 짚히는 쪽이 제 차례에만 보여 줄 것이 있다.
   */
  const setActiveTarget = tour?.setActiveTarget;
  useEffect(() => {
    if (!setActiveTarget) return;
    setActiveTarget(isRunning ? step?.target ?? null : null);
  }, [setActiveTarget, isRunning, step]);

  useEffect(
    () => () => {
      setActiveTarget?.(null);
    },
    [setActiveTarget],
  );

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

  useEffect(
    () => () => {
      if (revealTimer.current === null) return;
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    },
    [],
  );

  if (!isRunning || !plan || !step || !rect) return null;

  return (
    <CoachmarkOverlay
      step={step}
      index={index}
      total={plan.length}
      rect={rect}
      extraRect={extraRect}
      practiceHint={practiceHint}
      onNext={handleNext}
      onPrev={index > 0 ? handlePrev : undefined}
      onSkip={finish}
    />
  );
}
