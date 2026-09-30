const React = require('react');
const { View } = require('react-native');

/**
 * 제스처 정의는 끝없이 이어지는 체이닝이다.
 *
 * 화면마다 쓰는 메서드가 달라서 필요한 것만 흉내 내면 새 제스처를 쓸 때마다
 * 목이 깨진다. 무엇이 오든 자기 자신을 돌려주는 프록시로 둔다.
 */
const chainable = () =>
  new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'toJSON') return () => 'Gesture';
        if (prop === Symbol.toPrimitive) return () => 'Gesture';
        return () => chainable();
      },
    },
  );

const Gesture = new Proxy(
  {},
  { get: () => () => chainable() },
);

const passthrough = ({ children }) =>
  React.createElement(View, null, children);

module.exports = {
  Gesture,
  GestureDetector: passthrough,
  GestureHandlerRootView: passthrough,
  Directions: {},
  State: {},
  gestureHandlerRootHOC: (Component) => Component,
};
