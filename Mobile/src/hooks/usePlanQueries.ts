import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPlan,
  createFullPlan,
  CreatePlanPayload,
  FullPlanPayload,
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


