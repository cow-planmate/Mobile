import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import PlaceDetailSheet from '../PlaceDetailSheet';
import { fetchPlaceDetail } from '../../../../api/place';

jest.mock('../../../../api/place', () => {
  const actual = jest.requireActual('../../../../api/place');
  return { ...actual, fetchPlaceDetail: jest.fn() };
});

const mockFetch = fetchPlaceDetail as jest.Mock;

const texts = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root
    .findAllByType(Text)
    .flatMap(node => {
      const children = node.props.children;
      return Array.isArray(children) ? children : [children];
    })
    .filter(child => typeof child === 'string' || typeof child === 'number')
    .map(String);

const open = async (props: Record<string, unknown> = {}) => {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <PlaceDetailSheet
        visible
        contentId="2932888"
        fallbackName="전주콩나물해장국"
        onClose={jest.fn()}
        {...props}
      />,
    );
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree;
};

const restaurant = {
  contentId: '2932888',
  title: '전주콩나물해장국',
  category: 'RESTAURANT',
  addr1: '서울특별시 종로구 자하문로 3',
  overview: '따뜻한 뚝배기에 담겨 나오는 콩나물 국밥 전문점이다.',
  restaurant: {
    firstMenu: '콩나물국밥',
    treatMenu: '콩나물국밥, 돌솥알밥',
    openTime: '06:00~20:30',
  },
};

describe('PlaceDetailSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('소개와 메뉴, 갈래에 맞는 이용 정보를 보여 준다', async () => {
    mockFetch.mockResolvedValue(restaurant);
    const tree = await open();

    const shown = texts(tree);
    expect(shown).toContain('전주콩나물해장국');
    expect(shown).toContain(
      '따뜻한 뚝배기에 담겨 나오는 콩나물 국밥 전문점이다.',
    );
    expect(shown).toContain('콩나물국밥');
    // 식당은 영업 시간을 보여 준다 - 관광지의 이용 시간과 다른 줄이다.
    expect(shown).toContain('영업 시간');
    expect(shown).toContain('06:00~20:30');
    // 원문에 섞여 오는 메뉴는 알약으로 펴 둔다.
    expect(shown).toContain('돌솥알밥');
    act(() => tree.unmount());
  });

  it('값이 없는 줄은 아예 그리지 않는다', async () => {
    mockFetch.mockResolvedValue({
      ...restaurant,
      restaurant: { openTime: '06:00~20:30' },
    });
    const tree = await open();

    const shown = texts(tree);
    // 빈 제목만 남으면 안 불러온 것처럼 보인다.
    expect(shown).not.toContain('쉬는 날');
    expect(shown).not.toContain('주차');
    expect(shown).not.toContain('메뉴');
    act(() => tree.unmount());
  });

  it('사진이 없으면 빈 칸 대신 그렇다고 알린다', async () => {
    mockFetch.mockResolvedValue({ ...restaurant, images: [] });
    const tree = await open();

    expect(texts(tree)).toContain('등록된 사진이 없어요');
    act(() => tree.unmount());
  });

  it('아직 없는 장소는 실패가 아니라 없다고 알린다', async () => {
    mockFetch.mockRejectedValue({ response: { status: 404 } });
    const tree = await open();

    // 실패라고만 하면 몇 번이고 다시 누른다.
    expect(texts(tree)).toContain(
      '이 장소의 상세 정보는 아직 제공되지 않아요.',
    );
    act(() => tree.unmount());
  });

  it('담기를 주지 않은 자리에는 담기 단추를 세우지 않는다', async () => {
    mockFetch.mockResolvedValue(restaurant);
    const withAdd = await open({ onAdd: jest.fn() });
    expect(
      withAdd.root
        .findAllByType(TouchableOpacity)
        .some(node => node.props.accessibilityLabel === '시간표에 담기'),
    ).toBe(true);
    act(() => withAdd.unmount());

    // 이미 시간표에 있는 장소를 또 담을 수는 없다.
    const readOnly = await open();
    expect(
      readOnly.root
        .findAllByType(TouchableOpacity)
        .some(node => node.props.accessibilityLabel === '시간표에 담기'),
    ).toBe(false);
    act(() => readOnly.unmount());
  });

  it('사진이 있으면 한국관광공사 출처 캡션을 표시한다', async () => {
    mockFetch.mockResolvedValue({
      ...restaurant,
      images: [{ originUrl: 'https://example.com/food.jpg' }],
    });
    const tree = await open();

    expect(texts(tree)).toContain('출처: 한국관광공사');
    act(() => tree.unmount());
  });

  it('공공데이터 및 공공누리 저작권 출처 고지 문구를 하단에 명시한다', async () => {
    mockFetch.mockResolvedValue({
      ...restaurant,
      copyrightDivCd: 'Type1',
    });
    const tree = await open();

    const shown = texts(tree);
    expect(
      shown.some(text =>
        text.includes(
          '사진 및 장소 정보 제공: 한국관광공사 TourAPI (공공누리 제1유형: 출처표시)',
        ),
      ),
    ).toBe(true);
    act(() => tree.unmount());
  });
});
