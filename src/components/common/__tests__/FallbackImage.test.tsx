import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import FastImage from 'react-native-fast-image';

import FallbackImage from '../FallbackImage';

const FALLBACK = <Text>대체</Text>;

const render = (uri?: string | null) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FallbackImage uri={uri} style={{ width: 10, height: 10 }} fallback={FALLBACK} />,
    );
  });
  return tree!;
};

const findImage = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(FastImage);

const hasFallback = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).some(node => node.props.children === '대체');

describe('FallbackImage', () => {
  it('uri가 있으면 이미지를 그린다', () => {
    const tree = render('https://example.com/a.png');

    expect(findImage(tree)).toHaveLength(1);
    expect(hasFallback(tree)).toBe(false);
  });

  it('uri가 없으면 대체 표시로 간다', () => {
    const tree = render(null);

    expect(findImage(tree)).toHaveLength(0);
    expect(hasFallback(tree)).toBe(true);
  });

  it('로딩에 실패하면 대체 표시로 내려간다', () => {
    const tree = render('https://example.com/a.png');

    act(() => {
      findImage(tree)[0].props.onError();
    });

    expect(findImage(tree)).toHaveLength(0);
    expect(hasFallback(tree)).toBe(true);
  });

  it('uri가 바뀌면 실패 상태를 되돌린다', () => {
    const tree = render('https://example.com/a.png');

    act(() => {
      findImage(tree)[0].props.onError();
    });
    expect(hasFallback(tree)).toBe(true);

    // 목록에서 행이 재활용되는 상황 — 앞 항목의 실패가 눌러붙으면 안 된다.
    act(() => {
      tree.update(
        <FallbackImage
          uri="https://example.com/b.png"
          style={{ width: 10, height: 10 }}
          fallback={FALLBACK}
        />,
      );
    });

    expect(findImage(tree)).toHaveLength(1);
    expect(hasFallback(tree)).toBe(false);
  });
});
