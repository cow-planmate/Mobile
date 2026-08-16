
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

  patchJsxRuntime(require('react/jsx-runtime'), ['jsx', 'jsxs']);
  if (__DEV__) {
    patchJsxRuntime(require('react/jsx-dev-runtime'), ['jsxDEV']);
  }

  patchCreateElement();
} catch (error) {
  if (__DEV__) {
    console.warn('[fontScalingGuard] 적용 실패', error);
  }
}

export {};
