/**
 * 동시 실행 수를 제한한 비동기 실행 헬퍼.
 *
 * 모바일 회선에서는 요청을 한꺼번에 띄우는 것이 오히려 느리다. 연결 수립과
 * 대역폭을 서로 잠식해 첫 응답이 늦어지고, 외부 API 쿼터도 급하게 소모된다.
 * Promise.all/allSettled를 그대로 쓰는 대신 이 헬퍼로 상한을 둔다.
 */

/** items를 limit개씩 동시 실행하며 입력 순서를 유지해 매핑한다. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker),
  );
  return results;
}

/**
 * `Promise.allSettled`와 같은 결과를 주되 동시 실행 수를 제한한다.
 * 입력이 이미 시작된 Promise가 아니라 thunk여야 상한이 의미를 갖는다.
 */
export async function allSettledWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  return mapWithConcurrency(
    tasks,
    limit,
    async (task): Promise<PromiseSettledResult<T>> => {
      try {
        return { status: 'fulfilled', value: await task() };
      } catch (reason) {
        return { status: 'rejected', reason };
      }
    },
  );
}
