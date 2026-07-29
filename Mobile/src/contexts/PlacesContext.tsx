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
  fetchTourPlacesNoAuth,
  fetchLodgingPlacesNoAuth,
  fetchRestaurantPlacesNoAuth,
  searchPlaces,
  searchPlacesNoAuth,
  fetchNextPlaces,
} from '../api/trips';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface PlacesState {
  tour: PlaceVO[];
  lodging: PlaceVO[];
  restaurant: PlaceVO[];
  search: PlaceVO[];

  tourNext: string[];
  lodgingNext: string[];
  restaurantNext: string[];
  searchNext: string[];

  isLoading: boolean;
  isPetFriendly: boolean;
}

interface PlacesContextType extends PlacesState {
  /** 일정 추천 장소(관광지, 숙소, 식당) 전체 조회 (force: true 시 강제 갱신) */
  fetchAllRecommendations: (destinationId: number, force?: boolean) => Promise<void>;
  /** 비인증 추천 장소 전체 조회 */
  fetchAllRecommendationsNoAuth: (
    destinationId: number,
    force?: boolean,
  ) => Promise<void>;
  /** 키워드 장소 검색 */
  doSearchPlaces: (
    planIdOrNull: string | null,
    query: string,
  ) => Promise<void>;
  /** 장소 카테고리별 다음 페이지 추가 조회 */
  loadMorePlaces: (
    field: 'tour' | 'lodging' | 'restaurant' | 'search',
  ) => Promise<void>;
  /** 전체 장소 상태 초기화 */
  resetPlaces: () => void;
  /** 반려동물 동반 필터링 상태 설정 */
  setPetFriendly: (val: boolean) => void;
}


const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

// ────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────

export function PlacesProvider({children}: PropsWithChildren) {
  const [tour, setTour] = useState<PlaceVO[]>([]);
  const [lodging, setLodging] = useState<PlaceVO[]>([]);
  const [restaurant, setRestaurant] = useState<PlaceVO[]>([]);
  const [search, setSearch] = useState<PlaceVO[]>([]);

  const [tourNext, setTourNext] = useState<string[]>([]);
  const [lodgingNext, setLodgingNext] = useState<string[]>([]);
  const [restaurantNext, setRestaurantNext] = useState<string[]>([]);
  const [searchNext, setSearchNext] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPetFriendly, setPetFriendly] = useState(false);

  const lastFetchedDestRef = useRef<{
    destinationId: number | null;
    isFetching: boolean;
  }>({ destinationId: null, isFetching: false });

  const fetchAllRecommendations = useCallback(
    async (destinationId: number, force: boolean = false) => {
      // 동일한 destinationId에 대한 중복 및 동시 조회 요청 방지 가드
      if (
        !force &&
        (lastFetchedDestRef.current.isFetching ||
          lastFetchedDestRef.current.destinationId === destinationId)
      ) {
        return;
      }

      lastFetchedDestRef.current = { destinationId, isFetching: true };
      setIsLoading(true);
      if (destinationId === 123) {
        setTour([
          {
            placeId: 'tour-1',
            name: '협재 해수욕장',
            categoryId: 0,
            formatted_address: '제주특별자치도 제주시 한림읍 협재리 2497-1',
            rating: 4.6,
            photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200',
            yLocation: 33.3940,
            xLocation: 126.2397,
          },
          {
            placeId: 'tour-2',
            name: '한라산 국립공원',
            categoryId: 0,
            formatted_address: '제주특별자치도 제주시 해안동',
            rating: 4.8,
            photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200',
            yLocation: 33.3617,
            xLocation: 126.5292,
          },
        ]);
        setLodging([
          {
            placeId: 'lodging-1',
            name: '제주 신라호텔',
            categoryId: 1,
            formatted_address: '제주특별자치도 서귀포시 중문관광로72번길 75',
            rating: 4.7,
            photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
            yLocation: 33.2475,
            xLocation: 126.4082,
          },
        ]);
        setRestaurant([
          {
            placeId: 'restaurant-1',
            name: '오는정김밥',
            categoryId: 2,
            formatted_address: '제주특별자치도 서귀포시 동문동로 2',
            rating: 4.3,
            photoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200',
            yLocation: 33.2505,
            xLocation: 126.5684,
          },
        ]);
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
        setTourNext([]);
        setLodging(lodgingData.places || []);
        setLodgingNext([]);
        setRestaurant(restaurantData.places || []);
        setRestaurantNext([]);
      } catch (err) {
        console.error('추천 장소 조회 실패:', err);
      } finally {
        lastFetchedDestRef.current.isFetching = false;
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchAllRecommendationsNoAuth = useCallback(
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
      try {
        const [tourData, lodgingData, restaurantData] = await Promise.all([
          fetchTourPlacesNoAuth(destinationId),
          fetchLodgingPlacesNoAuth(destinationId),
          fetchRestaurantPlacesNoAuth(destinationId),
        ]);

        setTour(tourData.places || []);
        setTourNext([]);
        setLodging(lodgingData.places || []);
        setLodgingNext([]);
        setRestaurant(restaurantData.places || []);
        setRestaurantNext([]);
      } catch (err) {
        console.error('추천 장소 조회 실패 (비인증):', err);
      } finally {
        lastFetchedDestRef.current.isFetching = false;
        setIsLoading(false);
      }
    },
    [],
  );


  const doSearchPlaces = useCallback(
    async (planIdOrNull: string | null, query: string) => {
      setIsLoading(true);
      if (planIdOrNull === 123) {
        setSearch([
          {
            placeId: 'search-1',
            name: `${query} 맛집`,
            categoryId: 2,
            formatted_address: `제주 제주시 ${query}로 12`,
            rating: 4.5,
            yLocation: 33.5113,
            xLocation: 126.4930,
          },
        ]);
        setIsLoading(false);
        return;
      }
      try {
        const result = planIdOrNull
          ? await searchPlaces(planIdOrNull, query)
          : await searchPlacesNoAuth(query);

        setSearch(result.places || []);
        setSearchNext(result.nextPageTokens || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadMorePlaces = useCallback(
    async (field: 'tour' | 'lodging' | 'restaurant' | 'search') => {
      const tokenMap = {
        tour: tourNext,
        lodging: lodgingNext,
        restaurant: restaurantNext,
        search: searchNext,
      };
      const tokens = tokenMap[field];
      if (!tokens || tokens.length === 0) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await fetchNextPlaces(tokens);
        const newPlaces = result.places || [];
        const newTokens = result.nextPageTokens || [];

        switch (field) {
          case 'tour':
            setTour(prev => [...prev, ...newPlaces]);
            setTourNext(newTokens);
            break;
          case 'lodging':
            setLodging(prev => [...prev, ...newPlaces]);
            setLodgingNext(newTokens);
            break;
          case 'restaurant':
            setRestaurant(prev => [...prev, ...newPlaces]);
            setRestaurantNext(newTokens);
            break;
          case 'search':
            setSearch(prev => [...prev, ...newPlaces]);
            setSearchNext(newTokens);
            break;
        }
      } catch (err) {
        console.error(`Failed to load more ${field}:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [tourNext, lodgingNext, restaurantNext, searchNext],
  );

  const resetPlaces = useCallback(() => {
    setTour([]);
    setLodging([]);
    setRestaurant([]);
    setSearch([]);
    setTourNext([]);
    setLodgingNext([]);
    setRestaurantNext([]);
    setSearchNext([]);
  }, []);

  const contextValue = useMemo(() => ({
    tour,
    lodging,
    restaurant,
    search,
    tourNext,
    lodgingNext,
    restaurantNext,
    searchNext,
    isLoading,
    isPetFriendly,
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
    doSearchPlaces,
    loadMorePlaces,
    resetPlaces,
    setPetFriendly,
  }), [
    tour, lodging, restaurant, search,
    tourNext, lodgingNext, restaurantNext, searchNext,
    isLoading, isPetFriendly,
    fetchAllRecommendations, fetchAllRecommendationsNoAuth,
    doSearchPlaces, loadMorePlaces, resetPlaces, setPetFriendly
  ]);

  return (
    <PlacesContext.Provider value={contextValue}>
      {children}
    </PlacesContext.Provider>
  );
}

// ────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}
