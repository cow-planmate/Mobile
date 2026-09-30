import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import PlaceRecommendationList from '../PlaceRecommendationList';
import { searchPlacesByKeyword } from '../../../../api/trips';

const mockLoadMorePlaces = jest.fn();
const mockSearchPlacesByKeyword = searchPlacesByKeyword as jest.Mock;

jest.mock('../../../../api/trips', () => {
  const actual = jest.requireActual('../../../../api/trips');
  return { ...actual, searchPlacesByKeyword: jest.fn() };
});

jest.mock('../../../../contexts/PlacesContext', () => ({
  usePlaces: () => ({
    tour: [
      {
        placeId: 'place-1',
        name: '장소',
        categoryId: 0,
        formatted_address: '',
        rating: 0,
        xLocation: 127,
        yLocation: 37,
        photoUrl: '',
        iconUrl: '',
      },
    ],
    lodging: [],
    restaurant: [],
    tourHasNext: true,
    lodgingHasNext: false,
    restaurantHasNext: false,
    isLoading: false,
    loadMorePlaces: mockLoadMorePlaces,
    fetchAllRecommendations: jest.fn(),
    isPetFriendly: false,
    setPetFriendly: jest.fn(),
  }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: jest.fn() }),
}));

jest.mock('../KakaoMapView', () => () => null);
jest.mock('../../../../components/common/FallbackImage', () => () => null);
jest.mock('../../../../components/common', () => ({
  GoogleMapsIcon: () => null,
}));

describe('PlaceRecommendationList pagination', () => {
  it('목록 끝에 도달하면 현재 탭의 다음 페이지를 불러온다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PlaceRecommendationList travelId={1} onAddPlace={jest.fn()} />,
      );
    });

    act(() => {
      tree!.root.findByType(FlatList).props.onEndReached();
    });

    expect(mockLoadMorePlaces).toHaveBeenCalledWith('tour');
    act(() => tree!.unmount());
  });

  it('검색 탭에서 새 키워드 검색 API 결과를 장소 카드로 보여준다', async () => {
    mockSearchPlacesByKeyword.mockResolvedValue({
      places: [
        {
          placeId: '2932888',
          name: '전주콩나물해장국',
          categoryId: 2,
          formatted_address: '서울특별시 종로구 자하문로 3',
          rating: 0,
          xLocation: 126.97,
          yLocation: 37.58,
          photoUrl: '',
          iconUrl: '',
        },
      ],
      totalCount: 1,
      page: 1,
      size: 20,
      hasNext: false,
    });
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PlaceRecommendationList travelId={1} onAddPlace={jest.fn()} />,
      );
    });

    const searchTab = tree.root
      .findAllByType(TouchableOpacity)
      .find(button =>
        button.findAllByType(Text).some(text => text.props.children === '검색'),
      );
    act(() => searchTab!.props.onPress());
    act(() =>
      tree.root
        .findByProps({ accessibilityLabel: '장소 검색어' })
        .props.onChangeText('콩나물'),
    );
    await act(async () => {
      tree.root
        .findAllByType(TouchableOpacity)
        .find(button => button.props.accessibilityLabel === '장소 검색')!
        .props.onPress();
    });

    expect(mockSearchPlacesByKeyword).toHaveBeenCalledWith('콩나물');
    expect(
      tree.root.findAllByType(Text).some(text => text.props.children === '전주콩나물해장국'),
    ).toBe(true);
    act(() => tree.unmount());
  });
});
