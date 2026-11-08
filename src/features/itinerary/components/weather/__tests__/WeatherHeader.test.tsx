import React from 'react';
import renderer, { act } from 'react-test-renderer';
import WeatherHeader from '../WeatherHeader';
import type { SimpleWeatherInfo } from '../../../../../api/trips';

jest.mock('../WeatherIcon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-weather-icon' });
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props);
});

const baseWeather: SimpleWeatherInfo = {
  date: '2025-09-19',
  description: '흐림',
  tempMin: 18.6,
  tempMax: 26.4,
  feelsLike: 29.2,
};

const collect = (node: any, out: string[]) => {
  if (typeof node === 'string') {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach(child => collect(child, out));
    return;
  }
  if (node?.children) collect(node.children, out);
};

const textsOf = (
  weather: SimpleWeatherInfo,
  appearance: 'default' | 'overlay' | 'band' = 'band',
) => {
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(
      <WeatherHeader dayNumber={1} weather={weather} appearance={appearance} />,
    );
  });
  const out: string[] = [];
  collect(tree!.toJSON(), out);
  return out.join('');
};

describe('WeatherHeader', () => {
  it('band는 최고기온을 크게, 최저·체감을 한 줄로 보여 준다', () => {
    const text = textsOf(baseWeather);

    expect(text).toContain('26°');
    expect(text).toContain('흐림');
    expect(text).toContain('최저 19° · 체감 29°');
  });

  it('band는 큰 숫자가 최고기온임을 글자로 알린다', () => {
    expect(textsOf(baseWeather)).toContain('최고');
  });

  it('band에는 일차 글자를 적지 않는다', () => {
    expect(textsOf(baseWeather)).not.toContain('일차');
  });

  it('band도 예보가 아닌 값이면 어디서 온 값인지 밝힌다', () => {
    const text = textsOf({ ...baseWeather, dataSource: 'SEASONAL_AVERAGE' });

    expect(text).toContain('계절 평균 추정');
  });

  it('band에서 체감 온도가 없으면 최고기온으로 대신한다', () => {
    const text = textsOf({
      ...baseWeather,
      feelsLike: undefined as unknown as number,
    });

    expect(text).toContain('체감 26°');
  });

  it('overlay는 기존처럼 일차와 °C 단위를 보여 준다', () => {
    const text = textsOf(baseWeather, 'overlay');

    expect(text).toContain('1일차');
    expect(text).toContain('19°C');
  });
});
