import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
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
  /** Fetch all recommended places for a plan (tour, lodging, restaurant) */
  fetchAllRecommendations: (planId: number) => Promise<void>;
  /** Fetch all recommended places without auth */
  fetchAllRecommendationsNoAuth: (
    category: string,
    name: string,
  ) => Promise<void>;
  /** Search places */
  doSearchPlaces: (
    planIdOrNull: number | null,
    query: string,
  ) => Promise<void>;
  /** Load more places for a category using pagination tokens */
  loadMorePlaces: (
    field: 'tour' | 'lodging' | 'restaurant' | 'search',
  ) => Promise<void>;
  /** Reset all places */
  resetPlaces: () => void;
  /** Set pet friendly filtering state */
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

  const fetchAllRecommendations = useCallback(async (planId: number) => {
    setIsLoading(true);
    if (planId === 123) {
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
      setIsLoading(false);
      return;
    }

    try {
      const [tourData, lodgingData, restaurantData] = await Promise.all([
        fetchTourPlaces(planId),
        fetchLodgingPlaces(planId),
        fetchRestaurantPlaces(planId),
      ]);

      setTour(tourData.places || []);
      setTourNext(tourData.nextPageTokens || []);
      setLodging(lodgingData.places || []);
      setLodgingNext(lodgingData.nextPageTokens || []);
      setRestaurant(restaurantData.places || []);
      setRestaurantNext(restaurantData.nextPageTokens || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllRecommendationsNoAuth = useCallback(
    async (category: string, name: string) => {
      setIsLoading(true);
      try {
        const [tourData, lodgingData, restaurantData] = await Promise.all([
          fetchTourPlacesNoAuth(category, name),
          fetchLodgingPlacesNoAuth(category, name),
          fetchRestaurantPlacesNoAuth(category, name),
        ]);

        setTour(tourData.places || []);
        setTourNext(tourData.nextPageTokens || []);
        setLodging(lodgingData.places || []);
        setLodgingNext(lodgingData.nextPageTokens || []);
        setRestaurant(restaurantData.places || []);
        setRestaurantNext(restaurantData.nextPageTokens || []);
      } catch (err) {
        console.error('Failed to fetch recommendations (no auth):', err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const doSearchPlaces = useCallback(
    async (planIdOrNull: number | null, query: string) => {
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
