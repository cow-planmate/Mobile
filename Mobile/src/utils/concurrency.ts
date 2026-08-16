
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
