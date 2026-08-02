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

/** 일정 프레임 생성 요청 훅 */

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => createPlan(payload),
    onSuccess: () => {
      // 일정 목록 갱신을 위한 쿼리 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: ['myPlans'] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

/** 전체 구조화된 일정 저장 요청 훅 */
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

/** 키워드 기반 장소 검색 쿼리 훅 (일정 ID 존재 여부에 따른 조건 분기) */
export function useSearchPlaces(query: string, planId?: string) {
  return useQuery<PlacesResponse>({
    queryKey: ['placesSearch', query, planId],
    queryFn: () => {
      if (planId) {
        return searchPlaces(planId, query);
      }
      return searchPlacesNoAuth(query);
    },
    enabled: query.trim().length > 0, // 검색어가 비어있을 경우 쿼리 비활성화
    staleTime: 1000 * 60 * 2, // 검색 결과 2분간 신선도 유지
  });
}

