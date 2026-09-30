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

/**
 * 같은 이름표를 여럿이 달 수 있어서, 등록한 쪽이 누구인지 함께 적어 둔다.
 *
 * 시간표 블록은 그날 첫 블록 하나만 짚는데, 이름표는 블록마다 달려 있고 첫째가
 * 아닌 블록은 '나는 아니다'라며 등록을 지운다. 누가 지우는지 보지 않으면 둘째
 * 블록이 첫째의 등록까지 지워 버려, 장소가 둘 이상인 날에는 시간 조절·수정
 * 단계가 통째로 사라졌다. 지금 올라와 있는 것이 제 것일 때만 지우게 한다.
 */
type NodeOwner = object;

interface CoachmarkRegistry {
  register: (
    id: CoachmarkTargetId,
    node: MeasurableNode | null,
    owner: NodeOwner,
  ) => void;
  resolve: (id: CoachmarkTargetId) => MeasurableNode | null;
  /**
   * 안내가 그려지는 판. 짚을 자리를 이 판 기준으로 옮겨 적는 데 쓴다.
   *
   * measureInWindow는 '창' 기준 자리를 돌려주는데 안내는 이 판 안에 그려진다.
   * 안드로이드에서 둘이 상태바 높이만큼 어긋난다 - targetSdk 36부터 화면이
   * 상태바 아래까지 깔리지만 measureInWindow는 여전히 상태바를 뺀 자리를
   * 돌려주기 때문이다. 판도 같은 자로 재서 빼면 두 자가 같아진다.
   */
  resolveHost: () => MeasurableNode | null;
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
   * 안내가 지금 짚고 있는 것. 짚히는 쪽이 제 차례를 알아야 할 때 쓴다 -
   * 시간표는 비어 있을 때 예시 블록을 띄우는데, 시간 조절 차례가 오기 전에
   * 띄워 두면 담지도 않은 장소가 이미 놓인 것처럼 보인다.
   */
  activeTarget: CoachmarkTargetId | null;
  setActiveTarget: (target: CoachmarkTargetId | null) => void;
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
  const nodes = useRef(
    new Map<CoachmarkTargetId, { node: MeasurableNode; owner: NodeOwner }>(),
  ).current;
  const [isRunning, setIsRunning] = useState(false);
  const [activeTarget, setActiveTarget] = useState<CoachmarkTargetId | null>(
    null,
  );

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
    () => ({
      isRunning,
      openTour,
      closeTour,
      watchTouch,
      activeTarget,
      setActiveTarget,
    }),
    [isRunning, openTour, closeTour, watchTouch, activeTarget],
  );

  const hostNode = useRef<MeasurableNode | null>(null);
  const attachHost = useCallback((node: unknown) => {
    hostNode.current = isMeasurable(node) ? node : null;
  }, []);

  const registry = useMemo<CoachmarkRegistry>(
    () => ({
      register(id, node, owner) {
        if (node) {
          nodes.set(id, { node, owner });
          return;
        }
        // 남이 올려 둔 것을 대신 내려 주지 않는다.
        if (nodes.get(id)?.owner === owner) nodes.delete(id);
      },
      resolve(id) {
        return nodes.get(id)?.node ?? null;
      },
      resolveHost() {
        return hostNode.current;
      },
    }),
    [nodes],
  );

  return (
    <CoachmarkContext.Provider value={registry}>
      <CoachmarkTourContext.Provider value={tour}>
        <View
          ref={attachHost}
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
  // 이 자리를 올린 것이 나인지 가리는 표. 내용은 필요 없고 저마다 다르기만 하면 된다.
  const owner = useRef({}).current;

  // View·ScrollView·Animated.View가 저마다 다른 ref 타입을 요구한다. unknown으로
  // 받아 잴 수 있는 것인지 직접 확인해야 어디에나 그대로 매달 수 있다.
  return useCallback(
    (node: unknown) => {
      if (!registry) return;
      registry.register(id, enabled && isMeasurable(node) ? node : null, owner);
    },
    [registry, id, enabled, owner],
  );
}

function isMeasurable(node: unknown): node is MeasurableNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof (node as MeasurableNode).measureInWindow === 'function'
  );
}
