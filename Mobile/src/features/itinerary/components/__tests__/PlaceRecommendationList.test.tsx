import React from 'react';
import { FlatList } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import PlaceRecommendationList from '../PlaceRecommendationList';

const mockLoadMorePlaces = jest.fn();

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
});
