import { useEffect, useState } from 'react';

/** 일정이 준비된 뒤 날씨를 기다려 주는 최대 시간(ms). */
export const WEATHER_WAIT_MS = 3000;

/**
 * 화면을 처음 열 때만, 일정이 준비된 뒤 날씨가 도착할 때까지 로딩을 유지할지 알려준다.
 *
 * 날씨는 느려도 일정 화면을 막을 만큼 중요하지 않아서 최대 WEATHER_WAIT_MS까지만 기다린다.
 * 한 번 풀린 뒤에는 날짜를 바꿔 날씨를 다시 받아도 로딩이 다시 뜨지 않는다.
 */
export function useWeatherWaitGate(
  planReady: boolean,
  weatherPending: boolean,
): boolean {
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (released || !planReady) return;
    if (!weatherPending) {
      setReleased(true);
      return;
    }
    const timer = setTimeout(() => setReleased(true), WEATHER_WAIT_MS);
    return () => clearTimeout(timer);
  }, [released, planReady, weatherPending]);

  return planReady && weatherPending && !released;
}
