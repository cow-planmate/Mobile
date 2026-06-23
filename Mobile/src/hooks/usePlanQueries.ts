import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPlan,
  createFullPlan,
  searchPlaces,
  searchPlacesNoAuth,
  CreatePlanPayload,
  FullPlanPayload,
  PlacesResponse,
} from '../api/trips';

/** Hook for creating a plan template */
export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => createPlan(payload),
    onSuccess: (data) => {
      // Invalidate plans cache to update list views
      void queryClient.invalidateQueries({ queryKey: ['myPlans'] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

/** Hook for creating a full structured plan */
export function useCreateFullPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FullPlanPayload) => createFullPlan(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['myPlans'] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

/** Hook for searching tourist/restaurant/lodging places by keyword, with planId routing */
export function useSearchPlaces(query: string, planId?: number) {
  return useQuery<PlacesResponse>({
    queryKey: ['placesSearch', query, planId],
    queryFn: () => {
      if (planId && planId > 0) {
        return searchPlaces(planId, query);
      }
      return searchPlacesNoAuth(query);
    },
    enabled: query.trim().length > 0, // Disable query when search field is blank
    staleTime: 1000 * 60 * 2, // 2 minutes stale time during active search sessions
  });
}
