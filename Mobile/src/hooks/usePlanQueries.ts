import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFullPlan, FullPlanPayload } from '../api/trips';
import { invalidatePlanCaches } from './planCache';

export function useCreateFullPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FullPlanPayload) => createFullPlan(payload),
    onSuccess: () => {
      void invalidatePlanCaches(queryClient);
    },
  });
}
