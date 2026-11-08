import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useWeatherWaitGate, WEATHER_WAIT_MS } from '../useWeatherWaitGate';

type Props = { planReady: boolean; weatherPending: boolean };

describe('useWeatherWaitGate', () => {
  let waiting = false;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = ({ planReady, weatherPending }: Props) => {
    waiting = useWeatherWaitGate(planReady, weatherPending);
    return null;
  };

  const render = async (props: Props) => {
    await ReactTestRenderer.act(async () => {
      if (renderer) {
        renderer.update(<Probe {...props} />);
      } else {
        renderer = ReactTestRenderer.create(<Probe {...props} />);
      }
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    waiting = false;
    renderer = undefined as unknown as ReactTestRenderer.ReactTestRenderer;
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
    });
    jest.useRealTimers();
  });

  it('일정이 준비되기 전에는 기다리지 않는다', async () => {
    await render({ planReady: false, weatherPending: true });
    expect(waiting).toBe(false);
  });

  it('일정이 준비되고 날씨가 대기 중이면 기다린다', async () => {
    await render({ planReady: true, weatherPending: true });
    expect(waiting).toBe(true);
  });

  it('날씨가 도착하면 풀린다', async () => {
    await render({ planReady: true, weatherPending: true });
    await render({ planReady: true, weatherPending: false });
    expect(waiting).toBe(false);
  });

  it('상한 시간이 지나면 날씨가 안 와도 풀린다', async () => {
    await render({ planReady: true, weatherPending: true });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(WEATHER_WAIT_MS);
    });
    expect(waiting).toBe(false);
  });

  it('한 번 풀린 뒤 날씨를 다시 받아도 로딩이 다시 뜨지 않는다', async () => {
    await render({ planReady: true, weatherPending: false });
    await render({ planReady: true, weatherPending: true });
    expect(waiting).toBe(false);
  });
});
