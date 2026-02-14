import React, {
  createContext,
  useState,
  useContext,
  useCallback,
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

  const fetchAllRecommendations = useCallback(async (planId: number) => {
    setIsLoading(true);
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

  return (
    <PlacesContext.Provider
      value={{
        tour,
        lodging,
        restaurant,
        search,
        tourNext,
        lodgingNext,
        restaurantNext,
        searchNext,
        isLoading,
        fetchAllRecommendations,
        fetchAllRecommendationsNoAuth,
        doSearchPlaces,
        loadMorePlaces,
        resetPlaces,
      }}>
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
