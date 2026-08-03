import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { PlacesProvider, usePlaces } from '../src/contexts/PlacesContext';
import { PlaceVO } from '../src/api/trips';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-reanimated to prevent issues during testing
jest.mock('react-native-reanimated', () => {
  return {
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (toValue: any) => toValue,
    withSpring: (toValue: any) => toValue,
    cancelAnimation: () => {},
    runOnJS: (fn: any) => fn,
    interpolate: (value: number, inputRange: number[], outputRange: number[]) => value,
    Extrapolation: { CLAMP: 'clamp' },
  };
});

describe('Pet Friendly Global Filtering Integration Test', () => {
  const mockPlaces: PlaceVO[] = [
    {
      placeId: '1',
      categoryId: 0,
      url: '',
      name: '애견 동반 브런치 카페',
      formatted_address: '제주도 제주시 노형동',
      rating: 4.5,
      xLocation: 126,
      yLocation: 33,
      photoUrl: '',
      iconUrl: '',
    },
    {
      placeId: '2',
      categoryId: 1,
      url: '',
      name: '일반 관광 호텔',
      formatted_address: '제주도 서귀포시 중문동',
      rating: 4.0,
      xLocation: 126,
      yLocation: 33,
      photoUrl: '',
      iconUrl: '',
    },
    {
      placeId: '3',
      categoryId: 2,
      url: '',
      name: '반려동물 전용 리조트 펜션',
      formatted_address: '제주도 서귀포시 성산읍',
      rating: 4.8,
      xLocation: 126,
      yLocation: 33,
      photoUrl: '',
      iconUrl: '',
    },
  ];

  it('should manage petFriendly global filter state and filter places correctly', () => {
    let testContext: any = null;

    // A simple stub component to capture context values
    const TestComponent = () => {
      testContext = usePlaces();
      return null;
    };

    act(() => {
      renderer.create(
        <PlacesProvider>
          <TestComponent />
        </PlacesProvider>
      );
    });

    // 1. Initial State Check
    expect(testContext).toBeDefined();
    expect(testContext.isPetFriendly).toBe(false);

    // 2. State Toggle Check
    act(() => {
      testContext.setPetFriendly(true);
    });
    expect(testContext.isPetFriendly).toBe(true);

    act(() => {
      testContext.setPetFriendly(false);
    });
    expect(testContext.isPetFriendly).toBe(false);

    // 3. Filtering logic simulation check
    const filterPlaces = (places: PlaceVO[], isFilterOn: boolean) => {
      if (!isFilterOn) return places;
      const keywords = ['반려', '애견', '동반', '펫', 'pet', 'dog', '동물', '카페', '펜션', '공원', '해수욕장', '캠핑'];
      return places.filter(item => {
        const name = item.name || '';
        const address = item.formatted_address || '';
        return keywords.some(keyword =>
          name.toLowerCase().includes(keyword) || address.toLowerCase().includes(keyword)
        );
      });
    };

    // Filter OFF: should return all 3 places
    const unfilteredResults = filterPlaces(mockPlaces, false);
    expect(unfilteredResults.length).toBe(3);

    // Filter ON: should filter out "일반 관광 호텔" and keep "애견 동반 브런치 카페", "반려동물 전용 리조트 펜션"
    const filteredResults = filterPlaces(mockPlaces, true);
    expect(filteredResults.length).toBe(2);
    expect(filteredResults[0].placeId).toBe('1');
    expect(filteredResults[1].placeId).toBe('3');
  });
});
