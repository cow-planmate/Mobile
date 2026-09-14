import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
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
  /**
   * 손가락이 떨어질 때마다 그 손가락이 '닿기 시작한' 자리를 알려 준다.
   * 돌려주는 함수를 부르면 그만 듣는다.
   *
   * 끝이 아니라 시작 자리를 준다 - 시간표 블록을 끌면 손은 멀리 가지만
   * 짚어 준 것을 만진 자리는 처음 닿은 곳이다.
   */
  watchTouch: (listener: (x: number, y: number) => void) => () => void;
}

const CoachmarkTourContext = createContext<CoachmarkTour | null>(null);

export function CoachmarkProvider({ children }: { children: React.ReactNode }) {
  const nodes = useRef(new Map<CoachmarkTargetId, MeasurableNode>()).current;
  const [isRunning, setIsRunning] = useState(false);

  const openTour = useCallback(() => setIsRunning(true), []);
  const closeTour = useCallback(() => setIsRunning(false), []);

  /**
   * 짚어 준 것을 눌렀는지 알아내는 방법.
   *
   * 열세 개 버튼마다 '나 눌렸다'고 알리는 줄을 심을 수도 있지만, 그러면 버튼이
   * 늘 때마다 같은 줄을 또 심어야 한다. 대신 화면 전체를 한 겹 감싸고 지나가는
   * 손가락의 자리만 적어 둔다 - 막지 않으므로 버튼은 평소대로 눌린다.
   */
  const listeners = useRef(new Set<(x: number, y: number) => void>()).current;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    touchStart.current = { x: pageX, y: pageY };
  }, []);

  // 끌기 제스처가 손가락을 가져가면 끝 대신 취소가 온다. 둘 다 '뗐다'로 친다.
  const handleTouchEnd = useCallback(() => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    listeners.forEach(listen => listen(start.x, start.y));
  }, [listeners]);

  const watchTouch = useCallback(
    (listener: (x: number, y: number) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    [listeners],
  );

  const tour = useMemo<CoachmarkTour>(
    () => ({ isRunning, openTour, closeTour, watchTouch }),
    [isRunning, openTour, closeTour, watchTouch],
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
        <View
          style={styles.host}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {children}
        </View>
      </CoachmarkTourContext.Provider>
    </CoachmarkContext.Provider>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});

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
