/**
 * 글로벌 폰트 스케일링 가드.
 *
 * React 19에서 함수형 컴포넌트의 `defaultProps` 지원이 제거되었고,
 * RN 0.81의 Text/TextInput은 모두 함수형 컴포넌트다.
 * 따라서 기존의 `Text.defaultProps.allowFontScaling = false` 방식은
 * 아무 효과 없이 무시된다.
 *
 * 대신 엘리먼트 생성 지점(jsx-runtime / createElement)에서
 * Text·TextInput에 한해 `allowFontScaling` 기본값을 false로 주입한다.
 * 명시적으로 값을 지정한 곳은 그대로 존중한다.
 *
 * 이 모듈은 다른 어떤 앱 모듈보다 먼저(index.js 최상단) 로드되어야 한다.
 */
import React from 'react';
import { Text, TextInput } from 'react-native';

type AnyProps = Record<string, unknown> | null | undefined;

const GUARDED_TYPES: ReadonlySet<unknown> = new Set([Text, TextInput]);

const withGuard = (type: unknown, props: AnyProps): AnyProps => {
  if (!GUARDED_TYPES.has(type)) {
    return props;
  }
  if (props && 'allowFontScaling' in props) {
    return props;
  }
  return { ...(props ?? {}), allowFontScaling: false };
};

/** jsx / jsxs / jsxDEV 시그니처: (type, props, key, ...) */
const patchJsxRuntime = (runtime: Record<string, unknown>, keys: string[]) => {
  keys.forEach(key => {
    const original = runtime?.[key];
    if (typeof original !== 'function') {
      return;
    }
    runtime[key] = function patched(type: unknown, props: AnyProps, ...rest: unknown[]) {
      return (original as Function).call(this, type, withGuard(type, props), ...rest);
    };
  });
};

const patchCreateElement = () => {
  const react = React as unknown as Record<string, unknown>;
  const original = react.createElement;
  if (typeof original !== 'function') {
    return;
  }
  react.createElement = function patched(type: unknown, props: AnyProps, ...children: unknown[]) {
    return (original as Function).call(this, type, withGuard(type, props), ...children);
  };
};

try {
  // 자동 JSX 런타임 (앱 코드 전반)
  patchJsxRuntime(require('react/jsx-runtime'), ['jsx', 'jsxs']);
  if (__DEV__) {
    patchJsxRuntime(require('react/jsx-dev-runtime'), ['jsxDEV']);
  }
  // styled-components 등 classic createElement를 쓰는 라이브러리 대응
  patchCreateElement();
} catch (error) {
  if (__DEV__) {
    console.warn('[fontScalingGuard] 적용 실패', error);
  }
}

export {};
