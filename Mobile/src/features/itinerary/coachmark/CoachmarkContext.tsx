import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

export function CoachmarkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const nodes = useRef(new Map<CoachmarkTargetId, MeasurableNode>()).current;

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
      {children}
    </CoachmarkContext.Provider>
  );
}

export function useCoachmarkRegistry(): CoachmarkRegistry | null {
  return useContext(CoachmarkContext);
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

  return useCallback(
    (node: MeasurableNode | null) => {
      if (!registry) return;
      registry.register(id, enabled ? node : null);
    },
    [registry, id, enabled],
  );
}
