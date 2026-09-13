import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CoachmarkTargetId } from './coachmarkSteps';

/**
 * 안내가 짚을 대상을 모아 두는 곳.
 *
 * 짚을 것이 툴바부터 시간표 블록 안쪽까지 흩어져 있어 ref를 열세 개 손으로
 * 내려보내면 중간 컴포넌트마다 쓰지도 않는 prop이 하나씩 붙는다. 대상 쪽에서
 * 이름표를 달아 스스로 등록하게 두고, 안내는 이름으로 찾아간다.
 */

/** 안내는 화면상 위치만 알면 되므로 측정할 수 있는 것이면 무엇이든 받는다. */
export interface MeasurableNode {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
}

interface CoachmarkRegistry {
  register: (id: CoachmarkTargetId, node: MeasurableNode | null) => void;
  resolve: (id: CoachmarkTargetId) => MeasurableNode | null;
}

const CoachmarkContext = createContext<CoachmarkRegistry | null>(null);

/**
 * 안내를 여닫는 손잡이.
 *
 * 안내는 스스로 뜨지 않는다 - 물음표 단추를 눌러야 시작한다. 단추
 * (TutorialLauncher)는 시간표 위에, 안내(EditorCoachmark)는 화면 맨 위에 따로
 * 떠 있어서 "지금 열려 있는가"만 여기로 모은다. 말풍선을 권할지 말지는 기기에
 * 남기는 일이라 단추 쪽이 혼자 안다 - 이 파일은 시간표 카드도 함께 읽으므로
 * 저장소를 끌어들이면 안내와 무관한 곳까지 딸려 온다.
 */
interface CoachmarkTour {
  isRunning: boolean;
  openTour: () => void;
  closeTour: () => void;
}

const CoachmarkTourContext = createContext<CoachmarkTour | null>(null);

export function CoachmarkProvider({ children }: { children: React.ReactNode }) {
  const nodes = useRef(new Map<CoachmarkTargetId, MeasurableNode>()).current;
  const [isRunning, setIsRunning] = useState(false);

  const openTour = useCallback(() => setIsRunning(true), []);
  const closeTour = useCallback(() => setIsRunning(false), []);

  const tour = useMemo<CoachmarkTour>(
    () => ({ isRunning, openTour, closeTour }),
    [isRunning, openTour, closeTour],
  );

  const registry = useMemo<CoachmarkRegistry>(
    () => ({
      register(id, node) {
        if (node) {
          nodes.set(id, node);
        } else {
          nodes.delete(id);
        }
      },
      resolve(id) {
        return nodes.get(id) ?? null;
      },
    }),
    [nodes],
  );

  return (
    <CoachmarkContext.Provider value={registry}>
      <CoachmarkTourContext.Provider value={tour}>
        {children}
      </CoachmarkTourContext.Provider>
    </CoachmarkContext.Provider>
  );
}

export function useCoachmarkRegistry(): CoachmarkRegistry | null {
  return useContext(CoachmarkContext);
}

export function useCoachmarkTour(): CoachmarkTour | null {
  return useContext(CoachmarkTourContext);
}

/**
 * 안내가 짚을 대상에 매다는 ref.
 *
 * 같은 컴포넌트가 안내를 걸지 않는 화면(완성된 일정 등)에서도 쓰이므로,
 * Provider가 없으면 아무 일도 하지 않는다. `enabled`를 내리면 등록을 지운다 -
 * 시간표 블록처럼 여럿 중 첫째만 짚을 때 쓴다.
 */
export function useCoachmarkTarget(
  id: CoachmarkTargetId,
  enabled: boolean = true,
) {
  const registry = useContext(CoachmarkContext);

  // View·ScrollView·Animated.View가 저마다 다른 ref 타입을 요구한다. unknown으로
  // 받아 잴 수 있는 것인지 직접 확인해야 어디에나 그대로 매달 수 있다.
  return useCallback(
    (node: unknown) => {
      if (!registry) return;
      registry.register(id, enabled && isMeasurable(node) ? node : null);
    },
    [registry, id, enabled],
  );
}

function isMeasurable(node: unknown): node is MeasurableNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof (node as MeasurableNode).measureInWindow === 'function'
  );
}
