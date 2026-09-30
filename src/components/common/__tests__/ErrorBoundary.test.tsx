import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import ErrorBoundary from '../ErrorBoundary';

const Boom = ({ explode }: { explode: boolean }) => {
  if (explode) throw new Error('터짐');
  return <Text>정상 화면</Text>;
};

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map(n => n.props.children).flat().join(' ');

describe('ErrorBoundary', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    // 경계가 잡은 예외를 React가 콘솔로 다시 흘리는 것을 잠재운다.
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => spy.mockRestore());

  it('예외가 없으면 자식을 그대로 그린다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Boom explode={false} />
        </ErrorBoundary>,
      );
    });

    expect(texts(tree!)).toContain('정상 화면');
  });

  it('렌더 중 예외가 나면 복구 화면을 보여준다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Boom explode />
        </ErrorBoundary>,
      );
    });

    const shown = texts(tree!);
    expect(shown).toContain('문제가 생겼어요');
    expect(shown).toContain('다시 시도');
  });

  it('다시 시도를 누르면 자식을 새로 그린다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Boom explode />
        </ErrorBoundary>,
      );
    });

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: '다시 시도' })
        .props.onPress();
      tree!.update(
        <ErrorBoundary>
          <Boom explode={false} />
        </ErrorBoundary>,
      );
    });

    expect(texts(tree!)).toContain('정상 화면');
  });
});
