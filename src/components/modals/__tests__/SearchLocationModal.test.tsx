import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TextInput } from 'react-native';
import axios from 'axios';

import SearchLocationModal from '../SearchLocationModal';

jest.mock('axios');

const mockedGet = axios.get as jest.Mock;

const mount = async (onSelect = jest.fn()) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <SearchLocationModal visible onClose={jest.fn()} onSelect={onSelect} />
      </QueryClientProvider>,
    );
  });
  // react-query의 상태 알림은 타이머로 한 박자 늦게 온다. 목록이 뜰 때까지 비운다.
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return tree;
};

const type = (tree: renderer.ReactTestRenderer, text: string) =>
  act(() => {
    tree.root.findByType(TextInput).props.onChangeText(text);
  });

// 겹친 래퍼 말고 실제로 그려지는 글자 노드만 센다.
const isHostText = (n: renderer.ReactTestInstance) => (n.type as unknown) === 'Text';

const pressRegion = (tree: renderer.ReactTestRenderer, label: string) =>
  act(() => {
    tree.root
      .findAll(
        n =>
          n.props.accessibilityRole === 'tab' &&
          typeof n.props.onPress === 'function' &&
          n.findAll(t => isHostText(t) && t.props.children === label).length > 0,
      )[0]
      .props.onPress();
  });

// 여행지 이름 글자만 한 번씩 센다. numberOfLines={1}은 칸 글자에만 붙어 있다.
const cellNames = (tree: renderer.ReactTestRenderer) =>
  tree.root
    .findAll(n => isHostText(n) && n.props.numberOfLines === 1)
    .map(n => n.props.children);

describe('SearchLocationModal 검색', () => {
  beforeEach(() => {
    // 서버가 실패하면 28곳 기본 목록으로 대체된다.
    mockedGet.mockRejectedValue(new Error('network'));
    (axios.isCancel as unknown as jest.Mock) = jest.fn(() => false);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('검색어가 없으면 전체 여행지를 보여준다', async () => {
    const tree = await mount();
    expect(cellNames(tree)).toHaveLength(28);
  });

  it('이름에 검색어가 들어 있는 여행지만 남긴다', async () => {
    const tree = await mount();
    type(tree, '강릉');
    expect(cellNames(tree)).toEqual(['강릉']);
  });

  it('검색어는 도시 이름만 본다', async () => {
    const tree = await mount();
    // "강"은 지역명 "강원"에도 들어 있지만 이름에 든 곳만 나와야 한다.
    type(tree, '강');
    expect(cellNames(tree)).toEqual(['강릉']);
  });

  it('지역 칩을 누르면 그 지역 도시만 보인다', async () => {
    const tree = await mount();
    pressRegion(tree, '제주');
    expect(cellNames(tree)).toEqual(['제주', '서귀포']);
  });

  it('지역 칩과 검색어를 함께 적용한다', async () => {
    const tree = await mount();
    pressRegion(tree, '강원');
    type(tree, '속');
    expect(cellNames(tree)).toEqual(['속초']);
    pressRegion(tree, '제주');
    expect(cellNames(tree)).toEqual([]);
  });

  it('전체 칩을 누르면 모든 도시로 돌아온다', async () => {
    const tree = await mount();
    pressRegion(tree, '제주');
    pressRegion(tree, '전체');
    expect(cellNames(tree)).toHaveLength(28);
  });

  it('앞뒤 공백은 무시한다', async () => {
    const tree = await mount();
    type(tree, '  부산 ');
    expect(cellNames(tree)).toEqual(['부산']);
  });

  it('일치하는 곳이 없으면 안내 문구를 보여준다', async () => {
    const tree = await mount();
    type(tree, '없는곳');
    const texts = tree.root.findAllByType('Text' as any).map(n => n.props.children);
    expect(texts).toContain('검색 결과가 없어요');
  });

  it('검색 결과에서 고르면 onSelect가 불린다', async () => {
    const onSelect = jest.fn();
    const tree = await mount(onSelect);
    type(tree, '속초');
    const [cell] = tree.root.findAll(
      n => n.props.accessibilityRole === 'button' && n.props.accessibilityState?.selected !== undefined,
    );
    act(() => {
      cell.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('속초', 6);
  });
});
