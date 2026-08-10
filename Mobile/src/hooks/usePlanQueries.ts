import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFullPlan, FullPlanPayload } from '../api/trips';
import { invalidatePlanCaches } from './planCache';

/** 전체 구조화된 일정 저장 요청 훅 */
export function useCreateFullPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FullPlanPayload) => createFullPlan(payload),
    onSuccess: () => {
      void invalidatePlanCaches(queryClient);
    },
  });
}
