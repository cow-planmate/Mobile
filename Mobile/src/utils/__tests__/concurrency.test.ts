import {
  allSettledWithConcurrency,
  mapWithConcurrency,
} from '../concurrency';

/** 동시 실행 수를 관찰하기 위한 헬퍼. 최고 동시 실행 수를 기록한다. */
const makeTracker = () => {
  let active = 0;
  let peak = 0;
  return {
    get peak() {
      return peak;
    },
    run: async <T>(fn: () => Promise<T>): Promise<T> => {
      active += 1;
      peak = Math.max(peak, active);
      try {
        return await fn();
      } finally {
        active -= 1;
      }
    },
  };
};

const tick = () => new Promise(resolve => setImmediate(resolve));

describe('mapWithConcurrency', () => {
  it('입력 순서대로 결과를 돌려준다', async () => {
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async n => n * 2);
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it('동시 실행 수가 상한을 넘지 않는다', async () => {
    const tracker = makeTracker();
    await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3, item =>
      tracker.run(async () => {
        await tick();
        return item;
      }),
    );
    expect(tracker.peak).toBeLessThanOrEqual(3);
  });

  it('항목 수가 상한보다 적으면 항목 수만큼만 띄운다', async () => {
    const tracker = makeTracker();
    await mapWithConcurrency([1, 2], 10, item =>
      tracker.run(async () => {
        await tick();
        return item;
      }),
    );
    expect(tracker.peak).toBeLessThanOrEqual(2);
  });

  it('인덱스를 함께 넘긴다', async () => {
    const result = await mapWithConcurrency(['a', 'b'], 2, async (item, i) =>
      `${i}:${item}`,
    );
    expect(result).toEqual(['0:a', '1:b']);
  });

  it('빈 배열이면 빈 결과', async () => {
    expect(await mapWithConcurrency([], 3, async n => n)).toEqual([]);
  });
});

describe('allSettledWithConcurrency', () => {
  it('일부가 실패해도 나머지 결과를 살린다', async () => {
    const results = await allSettledWithConcurrency(
      [
        async () => 'ok1',
        async () => {
          throw new Error('boom');
        },
        async () => 'ok2',
      ],
      2,
    );

    expect(results[0]).toEqual({ status: 'fulfilled', value: 'ok1' });
    expect(results[1].status).toBe('rejected');
    expect((results[1] as PromiseRejectedResult).reason).toEqual(
      new Error('boom'),
    );
    expect(results[2]).toEqual({ status: 'fulfilled', value: 'ok2' });
  });

  it('동시 실행 수가 상한을 넘지 않는다', async () => {
    const tracker = makeTracker();
    const tasks = Array.from({ length: 9 }, (_, i) => () =>
      tracker.run(async () => {
        await tick();
        return i;
      }),
    );

    await allSettledWithConcurrency(tasks, 4);
    expect(tracker.peak).toBeLessThanOrEqual(4);
  });

  it('전부 실패해도 예외를 던지지 않는다', async () => {
    const results = await allSettledWithConcurrency(
      [
        async () => {
          throw new Error('a');
        },
        async () => {
          throw new Error('b');
        },
      ],
      2,
    );
    expect(results.every(r => r.status === 'rejected')).toBe(true);
  });
});
