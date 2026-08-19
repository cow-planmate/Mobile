import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
  PropsWithChildren,
} from 'react';

import {
  PlaceVO,
  fetchTourPlaces,
  fetchLodgingPlaces,
  fetchRestaurantPlaces,
} from '../api/trips';

const mergePlaces = (prev: PlaceVO[], newPlaces: PlaceVO[]) => {
  const existingIds = new Set(prev.map(p => p.placeId));
  const filtered = newPlaces.filter(p => !existingIds.has(p.placeId));
  return [...prev, ...filtered];
};

const DEMO_DESTINATION_ID = 123;

const demoPlace = (p: Partial<PlaceVO> & Pick<PlaceVO, 'placeId' | 'name'>): PlaceVO => ({
  categoryId: 0,
  url: '',
  formatted_address: '',
  rating: 0,
  xLocation: 0,
  yLocation: 0,
  photoUrl: '',
  iconUrl: '',
  ...p,
});

export interface PlacesState {
  tour: PlaceVO[];
  lodging: PlaceVO[];
  restaurant: PlaceVO[];

  tourPage: number;
  lodgingPage: number;
  restaurantPage: number;

  tourHasNext: boolean;
  lodgingHasNext: boolean;
  restaurantHasNext: boolean;

  isLoading: boolean;
  isPetFriendly: boolean;
}

interface PlacesContextType extends PlacesState {

  fetchAllRecommendations: (destinationId: number, force?: boolean) => Promise<void>;

  loadMorePlaces: (
    field: 'tour' | 'lodging' | 'restaurant',
  ) => Promise<void>;

  resetPlaces: () => void;

  setPetFriendly: (val: boolean) => void;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({children}: PropsWithChildren) {
  const [tour, setTour] = useState<PlaceVO[]>([]);
  const [lodging, setLodging] = useState<PlaceVO[]>([]);
  const [restaurant, setRestaurant] = useState<PlaceVO[]>([]);

  const [tourPage, setTourPage] = useState<number>(1);
  const [lodgingPage, setLodgingPage] = useState<number>(1);
  const [restaurantPage, setRestaurantPage] = useState<number>(1);

  const [tourHasNext, setTourHasNext] = useState<boolean>(false);
  const [lodgingHasNext, setLodgingHasNext] = useState<boolean>(false);
  const [restaurantHasNext, setRestaurantHasNext] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPetFriendly, setPetFriendly] = useState(false);

  const lastFetchedDestRef = useRef<{
    destinationId: number | null;
    isFetching: boolean;
  }>({ destinationId: null, isFetching: false });

  const fetchAllRecommendations = useCallback(
    async (destinationId: number, force: boolean = false) => {

      if (
        !force &&
        (lastFetchedDestRef.current.isFetching ||
          lastFetchedDestRef.current.destinationId === destinationId)
      ) {
        return;
      }

      lastFetchedDestRef.current = { destinationId, isFetching: true };
      setIsLoading(true);

      if (__DEV__ && destinationId === DEMO_DESTINATION_ID) {
        setTour([
          demoPlace({
            placeId: 'tour-1',
            name: '협재 해수욕장',
            formatted_address: '제주특별자치도 제주시 한림읍 협재리 2497-1',
            rating: 4.6,
            yLocation: 33.394,
            xLocation: 126.2397,
          }),
          demoPlace({
            placeId: 'tour-2',
            name: '한라산 국립공원',
            formatted_address: '제주특별자치도 제주시 해안동',
            rating: 4.8,
            yLocation: 33.3617,
            xLocation: 126.5292,
          }),
        ]);
        setLodging([
          demoPlace({
            placeId: 'lodging-1',
            name: '제주 신라호텔',
            categoryId: 1,
            formatted_address: '제주특별자치도 서귀포시 중문관광로72번길 75',
            rating: 4.7,
            yLocation: 33.2475,
            xLocation: 126.4082,
          }),
        ]);
        setRestaurant([
          demoPlace({
            placeId: 'restaurant-1',
            name: '오는정김밥',
            categoryId: 2,
            formatted_address: '제주특별자치도 서귀포시 동문동로 2',
            rating: 4.3,
            yLocation: 33.2505,
            xLocation: 126.5684,
          }),
        ]);
        setTourPage(1);
        setTourHasNext(false);
        setLodgingPage(1);
        setLodgingHasNext(false);
        setRestaurantPage(1);
        setRestaurantHasNext(false);
        lastFetchedDestRef.current.isFetching = false;
        setIsLoading(false);
        return;
      }

      try {
        const [tourData, lodgingData, restaurantData] = await Promise.all([
          fetchTourPlaces(destinationId),
          fetchLodgingPlaces(destinationId),
          fetchRestaurantPlaces(destinationId),
        ]);

        setTour(tourData.places || []);
        setTourPage(1);
        setTourHasNext(!!tourData.hasNext);

        setLodging(lodgingData.places || []);
        setLodgingPage(1);
        setLodgingHasNext(!!lodgingData.hasNext);

        setRestaurant(restaurantData.places || []);
        setRestaurantPage(1);
        setRestaurantHasNext(!!restaurantData.hasNext);
      } catch (err) {
        console.error('추천 장소 조회 실패:', err);

        lastFetchedDestRef.current.destinationId = null;
      } finally {
        lastFetchedDestRef.current.isFetching = false;
        setIsLoading(false);
      }
    },
    [],
  );

  const loadMorePlaces = useCallback(
    async (field: 'tour' | 'lodging' | 'restaurant') => {
      const destId = lastFetchedDestRef.current.destinationId;

      if (!destId) return;

      setIsLoading(true);
      try {
        if (field === 'tour') {
          if (!tourHasNext) return;
          const nextPage = tourPage + 1;
          const data = await fetchTourPlaces(destId, nextPage);
          setTour(prev => mergePlaces(prev, data.places || []));
          setTourPage(nextPage);
          setTourHasNext(!!data.hasNext);
        } else if (field === 'lodging') {
          if (!lodgingHasNext) return;
          const nextPage = lodgingPage + 1;
          const data = await fetchLodgingPlaces(destId, nextPage);
          setLodging(prev => mergePlaces(prev, data.places || []));
          setLodgingPage(nextPage);
          setLodgingHasNext(!!data.hasNext);
        } else if (field === 'restaurant') {
          if (!restaurantHasNext) return;
          const nextPage = restaurantPage + 1;
          const data = await fetchRestaurantPlaces(destId, nextPage);
          setRestaurant(prev => mergePlaces(prev, data.places || []));
          setRestaurantPage(nextPage);
          setRestaurantHasNext(!!data.hasNext);
        }
      } catch (err) {
        console.error(`Failed to load more ${field}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      tourPage,
      tourHasNext,
      lodgingPage,
      lodgingHasNext,
      restaurantPage,
      restaurantHasNext,
    ],
  );

  const resetPlaces = useCallback(() => {
    setTour([]);
    setLodging([]);
    setRestaurant([]);
    setTourPage(1);
    setLodgingPage(1);
    setRestaurantPage(1);
    setTourHasNext(false);
    setLodgingHasNext(false);
    setRestaurantHasNext(false);
    lastFetchedDestRef.current = { destinationId: null, isFetching: false };
  }, []);

  const contextValue = useMemo(() => ({
    tour,
    lodging,
    restaurant,
    tourPage,
    lodgingPage,
    restaurantPage,
    tourHasNext,
    lodgingHasNext,
    restaurantHasNext,
    isLoading,
    isPetFriendly,
    fetchAllRecommendations,
    loadMorePlaces,
    resetPlaces,
    setPetFriendly,
  }), [
    tour, lodging, restaurant,
    tourPage, lodgingPage, restaurantPage,
    tourHasNext, lodgingHasNext, restaurantHasNext,
    isLoading, isPetFriendly,
    fetchAllRecommendations,
    loadMorePlaces, resetPlaces, setPetFriendly
  ]);

  return (
    <PlacesContext.Provider value={contextValue}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}
