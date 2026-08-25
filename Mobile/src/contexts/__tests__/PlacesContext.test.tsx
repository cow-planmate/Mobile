import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { PlacesProvider, usePlaces } from '../PlacesContext';
import {
  fetchLodgingPlaces,
  fetchRestaurantPlaces,
  fetchTourPlaces,
  PlacesResponse,
} from '../../api/trips';

jest.mock('../../api/trips', () => ({
  fetchLodgingPlaces: jest.fn(),
  fetchRestaurantPlaces: jest.fn(),
  fetchTourPlaces: jest.fn(),
}));

const mockFetchTourPlaces = fetchTourPlaces as jest.MockedFunction<
  typeof fetchTourPlaces
>;
const mockFetchLodgingPlaces = fetchLodgingPlaces as jest.MockedFunction<
  typeof fetchLodgingPlaces
>;
const mockFetchRestaurantPlaces = fetchRestaurantPlaces as jest.MockedFunction<
  typeof fetchRestaurantPlaces
>;

const deferred = () => {
  let resolve: ((value: PlacesResponse) => void) | undefined;
  const promise = new Promise<PlacesResponse>(done => {
    resolve = done;
  });
  return { promise, resolve: (value: PlacesResponse) => resolve?.(value) };
};

const response = (destinationId: number): PlacesResponse => ({
  places: [
    {
      placeId: `place-${destinationId}`,
      categoryId: 0,
      url: '',
      name: `여행지 ${destinationId}`,
      formatted_address: '',
      rating: 0,
      xLocation: 0,
      yLocation: 0,
      photoUrl: '',
      iconUrl: '',
    },
  ],
  totalCount: 1,
  page: 1,
  size: 20,
  hasNext: false,
});

describe('PlacesContext', () => {
  it('이전 여행지 조회를 취소하고 최신 여행지 결과만 반영한다', async () => {
    const first = [deferred(), deferred(), deferred()];
    const second = [deferred(), deferred(), deferred()];
    mockFetchTourPlaces
      .mockReturnValueOnce(first[0].promise)
      .mockReturnValueOnce(second[0].promise);
    mockFetchLodgingPlaces
      .mockReturnValueOnce(first[1].promise)
      .mockReturnValueOnce(second[1].promise);
    mockFetchRestaurantPlaces
      .mockReturnValueOnce(first[2].promise)
      .mockReturnValueOnce(second[2].promise);

    let places: ReturnType<typeof usePlaces>;
    const Probe = () => {
      places = usePlaces();
      return null;
    };
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <PlacesProvider>
          <Probe />
        </PlacesProvider>,
      );
    });

    let firstRequest: Promise<void>;
    act(() => {
      firstRequest = places!.fetchAllRecommendations(1);
    });
    const firstSignal = mockFetchTourPlaces.mock.calls[0][3];

    let secondRequest: Promise<void>;
    act(() => {
      secondRequest = places!.fetchAllRecommendations(2);
    });
    expect(firstSignal?.aborted).toBe(true);

    await act(async () => {
      second.forEach(item => item.resolve(response(2)));
      await secondRequest!;
    });
    expect(places!.tour[0].name).toBe('여행지 2');

    await act(async () => {
      first.forEach(item => item.resolve(response(1)));
      await firstRequest!;
    });
    expect(places!.tour[0].name).toBe('여행지 2');

    act(() => tree!.unmount());
  });
});
