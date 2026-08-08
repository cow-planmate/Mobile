import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  ChecklistItem,
  ChecklistScope,
  createChecklistItem,
  deleteChecklistItem,
  editChecklistItemChecked,
  editChecklistItemContent,
  getChecklist,
  reorderChecklistItems,
} from '../../../api/checklist';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';

/**
 * 플랜 체크리스트 React Query 훅.
 *
 * 서버는 수정·삭제·정렬 응답에 본문을 주지 않는다. 그래서 성공 응답만으로는 갱신된
 * 값을 알 수 없어, 완료 토글과 순서 변경만 낙관적으로 반영하고(되돌릴 기준이 명확하다)
 * 나머지는 성공 후 다시 조회한다.
 *
 * 실시간 편집 세션 중 다른 사람이 바꾼 내용은 push되지 않으므로(서버 미구현),
 * 화면 진입·복귀 시 refetch가 유일한 갱신 경로다.
 */

export const checklistKeys = {
  all: ['checklist'] as const,
  plan: (planId: string) => ['checklist', planId] as const,
  scope: (planId: string, scope: ChecklistScope) =>
    ['checklist', planId, scope] as const,
};

const CHECKLIST_ERROR_FALLBACK = '체크리스트를 저장하지 못했습니다.';

/** 조회 실패·저장 실패 시 화면에 그대로 띄울 수 있는 문구를 만든다. */
export function getChecklistErrorMessage(error: unknown): string {
  return getDisplayErrorMessage(error, CHECKLIST_ERROR_FALLBACK);
}

/** 체크리스트 조회 */
export function useChecklist(
  planId: string | null | undefined,
  scope: ChecklistScope,
  enabled = true,
) {
  return useQuery<ChecklistItem[]>({
    queryKey: checklistKeys.scope(planId ?? '', scope),
    queryFn: () => getChecklist(planId as string, scope),
    enabled: !!planId && enabled,
  });
}

/** 뮤테이션 성공·실패 후 해당 목록을 서버 기준으로 다시 맞춘다. */
function useInvalidateScope(planId: string | null | undefined) {
  const queryClient = useQueryClient();

  return (scope: ChecklistScope) =>
    queryClient.invalidateQueries({
      queryKey: checklistKeys.scope(planId ?? '', scope),
    });
}

/** 항목 추가 */
export function useCreateChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation({
    mutationFn: (content: string) =>
      createChecklistItem(planId as string, scope, content),
    onSuccess: () => {
      void invalidateScope(scope);
    },
  });
}

/** 항목 내용 수정 */
export function useEditChecklistItemContent(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation({
    mutationFn: ({ itemId, content }: { itemId: number; content: string }) =>
      editChecklistItemContent(planId as string, scope, itemId, content),
    onSuccess: () => {
      void invalidateScope(scope);
    },
  });
}

/**
 * 완료 여부 토글.
 *
 * 체크는 연달아 누르는 조작이라 응답을 기다리면 화면이 끊긴다. 먼저 반영하고
 * 실패하면 직전 목록으로 되돌린다.
 */
export function useToggleChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const queryClient = useQueryClient();
  const queryKey = checklistKeys.scope(planId ?? '', scope);

  return useMutation({
    mutationFn: ({ itemId, isChecked }: { itemId: number; isChecked: boolean }) =>
      editChecklistItemChecked(planId as string, scope, itemId, isChecked),
    onMutate: async ({ itemId, isChecked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ChecklistItem[]>(queryKey);

      queryClient.setQueryData<ChecklistItem[]>(queryKey, items =>
        (items ?? []).map(item =>
          item.itemId === itemId ? { ...item, isChecked } : item,
        ),
      );

      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

/** 항목 삭제 */
export function useDeleteChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation({
    mutationFn: (itemId: number) =>
      deleteChecklistItem(planId as string, scope, itemId),
    onSettled: () => {
      // 이미 삭제된 항목(404)이어도 목록을 서버 기준으로 다시 맞춘다.
      void invalidateScope(scope);
    },
  });
}

/**
 * 순서 변경.
 *
 * 드래그가 끝난 순서를 그대로 보여줘야 하므로 먼저 반영한다. 서버에는 전체 목록을
 * 순서대로 보내야 하며(부분 전송 시 번호 충돌), 실패하면 직전 순서로 되돌린다.
 */
export function useReorderChecklistItems(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const queryClient = useQueryClient();
  const queryKey = checklistKeys.scope(planId ?? '', scope);

  return useMutation({
    mutationFn: (itemIds: number[]) =>
      reorderChecklistItems(planId as string, scope, itemIds),
    onMutate: async itemIds => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ChecklistItem[]>(queryKey);

      queryClient.setQueryData<ChecklistItem[]>(queryKey, items => {
        const byId = new Map((items ?? []).map(item => [item.itemId, item]));
        return itemIds
          .map((itemId, index) => {
            const item = byId.get(itemId);
            return item ? { ...item, sortOrder: index } : null;
          })
          .filter((item): item is ChecklistItem => !!item);
      });

      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * 공유·개인 목록과 진행률을 한 번에 쓰는 화면용 훅.
 *
 * 체크리스트는 두 목록을 나란히 보여주는 자리가 대부분이라 개별 훅을 매번 조합하는
 * 대신 여기서 묶는다.
 */
export function usePlanChecklists(
  planId: string | null | undefined,
  enabled = true,
) {
  const sharedQuery = useChecklist(planId, 'shared', enabled);
  const personalQuery = useChecklist(planId, 'personal', enabled);

  const sharedItems = useMemo(
    () => sharedQuery.data ?? [],
    [sharedQuery.data],
  );
  const personalItems = useMemo(
    () => personalQuery.data ?? [],
    [personalQuery.data],
  );

  const counts = useMemo(
    () => ({
      shared: {
        done: sharedItems.filter(item => item.isChecked).length,
        total: sharedItems.length,
      },
      personal: {
        done: personalItems.filter(item => item.isChecked).length,
        total: personalItems.length,
      },
    }),
    [personalItems, sharedItems],
  );

  return {
    sharedItems,
    personalItems,
    counts,
    isLoading: sharedQuery.isLoading || personalQuery.isLoading,
    isError: sharedQuery.isError || personalQuery.isError,
    error: sharedQuery.error ?? personalQuery.error,
    refetch: () => Promise.all([sharedQuery.refetch(), personalQuery.refetch()]),
  };
}
