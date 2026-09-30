import { useCallback, useRef, useState } from 'react';

/**
 * 제출 버튼을 연타했을 때 같은 요청이 두 번 나가는 것을 막는다.
 *
 * react-query의 isPending이나 useState 플래그는 다음 렌더에야 반영되므로 같은
 * 프레임 안에서 들어온 두 번째 탭을 통과시킨다. 동기적으로 읽히는 ref로 잠가야
 * 게시글·일정이 중복 생성되지 않는다.
 */
export function useSubmitLock() {
  const lockedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runExclusive = useCallback(
    async <T>(task: () => Promise<T>): Promise<T | undefined> => {
      if (lockedRef.current) return undefined;
      lockedRef.current = true;
      setIsSubmitting(true);
      try {
        return await task();
      } finally {
        lockedRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { isSubmitting, runExclusive };
}
