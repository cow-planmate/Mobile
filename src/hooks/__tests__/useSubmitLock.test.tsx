import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useSubmitLock } from '../useSubmitLock';

type Lock = ReturnType<typeof useSubmitLock>;

let lock: Lock;

const Probe = () => {
  lock = useSubmitLock();
  return null;
};

const mount = () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  act(() => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  return renderer!;
};

describe('useSubmitLock', () => {
  it('앞선 작업이 끝나기 전 재호출은 실행하지 않는다', async () => {
    let release: (value: string) => void = () => {};
    const task = jest.fn(
      () =>
        new Promise<string>(resolve => {
          release = resolve;
        }),
    );

    const renderer = mount();

    let first: Promise<string | undefined> | undefined;
    let second: Promise<string | undefined> | undefined;

    await act(async () => {
      first = lock.runExclusive(task);
      second = lock.runExclusive(task);
    });

    expect(task).toHaveBeenCalledTimes(1);
    expect(await second).toBeUndefined();

    await act(async () => {
      release('done');
      await first;
    });

    expect(await first).toBe('done');

    act(() => {
      renderer.unmount();
    });
  });

  it('작업이 끝나면 다시 실행할 수 있다', async () => {
    const task = jest.fn(() => Promise.resolve('ok'));
    const renderer = mount();

    await act(async () => {
      await lock.runExclusive(task);
    });
    await act(async () => {
      await lock.runExclusive(task);
    });

    expect(task).toHaveBeenCalledTimes(2);

    act(() => {
      renderer.unmount();
    });
  });

  it('작업이 실패해도 잠금을 풀어 재시도할 수 있다', async () => {
    const task = jest.fn(() => Promise.reject(new Error('boom')));
    const renderer = mount();

    await act(async () => {
      await lock.runExclusive(task).catch(() => undefined);
    });
    await act(async () => {
      await lock.runExclusive(task).catch(() => undefined);
    });

    expect(task).toHaveBeenCalledTimes(2);

    act(() => {
      renderer.unmount();
    });
  });
});
