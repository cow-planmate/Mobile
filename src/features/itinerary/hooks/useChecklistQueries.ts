import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  ChecklistItem,
  ChecklistScope,
  PlanChecklistSyncItem,
  createChecklistItem,
  deleteChecklistItem,
  editChecklistItemChecked,
  editChecklistItemContent,
  getChecklist,
  reorderChecklistItems,
} from '../../../api/checklist';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';

export const checklistKeys = {
  all: ['checklist'] as const,
  plan: (planId: string) => ['checklist', planId] as const,
  scope: (planId: string, scope: ChecklistScope) =>
    ['checklist', planId, scope] as const,
};

const CHECKLIST_ERROR_FALLBACK = '체크리스트를 저장하지 못했어요.';

interface ChecklistSyncEvent {
  action?: string;
  planChecklistItemDtos?: PlanChecklistSyncItem[];
}

interface OptimisticChecklistContext {
  previousItems: ChecklistItem[] | undefined;
  optimisticItems: ChecklistItem[] | undefined;
}

export function applyChecklistSync(
  currentItems: ChecklistItem[] | undefined,
  event: ChecklistSyncEvent,
): ChecklistItem[] | undefined {
  const action = String(event.action ?? '').toLowerCase();
  const nextItems = currentItems ? [...currentItems] : [];

  event.planChecklistItemDtos?.forEach(syncItem => {
    const itemId = syncItem.checklistItemId;
    if (itemId === undefined) return;

    const currentIndex = nextItems.findIndex(item => item.itemId === itemId);
    if (action === 'delete') {
      if (currentIndex >= 0) nextItems.splice(currentIndex, 1);
      return;
    }

    const currentItem = currentIndex >= 0 ? nextItems[currentIndex] : undefined;
    const nextItem: ChecklistItem = {
      itemId,
      content: syncItem.content ?? currentItem?.content ?? '',
      isChecked: syncItem.isChecked ?? currentItem?.isChecked ?? false,
      sortOrder: syncItem.sortOrder ?? currentItem?.sortOrder ?? nextItems.length,
    };

    if (currentIndex >= 0) nextItems[currentIndex] = nextItem;
    else nextItems.push(nextItem);
  });

  return nextItems.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.itemId - b.itemId,
  );
}

export function getChecklistErrorMessage(error: unknown): string {
  return getDisplayErrorMessage(error, CHECKLIST_ERROR_FALLBACK);
}

export function useChecklist(
  planId: string | null | undefined,
  scope: ChecklistScope,
  enabled = true,
) {
  return useQuery<ChecklistItem[]>({
    queryKey: checklistKeys.scope(planId ?? '', scope),
    queryFn: ({ signal }) => getChecklist(planId as string, scope, signal),
    enabled: !!planId && enabled,
    refetchOnMount: 'always',
    refetchInterval: scope === 'shared' && enabled ? 3000 : false,
    refetchIntervalInBackground: false,
  });
}

function useInvalidateScope(planId: string | null | undefined) {
  const queryClient = useQueryClient();

  return (scope: ChecklistScope) =>
    queryClient.invalidateQueries({
      queryKey: checklistKeys.scope(planId ?? '', scope),
    });
}

// SharedSync update DTOs cannot represent partial writes, so mutations use field-specific REST and shared polling propagates them.
export function useCreateChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation<number, unknown, string>({
    mutationFn: content => createChecklistItem(planId as string, scope, content),
    onSuccess: () => {
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
    },
  });
}

export function useEditChecklistItemContent(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation<void, unknown, { itemId: number; content: string }>({
    mutationFn: ({ itemId, content }) =>
      editChecklistItemContent(planId as string, scope, itemId, content),
    onSuccess: () => {
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
    },
  });
}

export function useToggleChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const queryClient = useQueryClient();
  const queryKey = checklistKeys.scope(planId ?? '', scope);

  return useMutation<
    void,
    unknown,
    { itemId: number; isChecked: boolean },
    OptimisticChecklistContext
  >({
    mutationFn: ({ itemId, isChecked }) =>
      editChecklistItemChecked(planId as string, scope, itemId, isChecked),
    onMutate: async ({ itemId, isChecked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ChecklistItem[]>(queryKey);

      const optimisticItems = queryClient.setQueryData<ChecklistItem[]>(
        queryKey,
        items =>
          (items ?? []).map(item =>
            item.itemId === itemId ? { ...item, isChecked } : item,
          ),
      );

      return { previousItems, optimisticItems };
    },
    onError: (_error, _variables, context) => {
      if (
        context?.previousItems &&
        queryClient.getQueryData(queryKey) === context.optimisticItems
      ) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },

    onSettled: () => {
      Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
        () => undefined,
      );
    },
  });
}

export function useDeleteChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);

  return useMutation<void, unknown, number>({
    mutationFn: itemId => deleteChecklistItem(planId as string, scope, itemId),
    onSettled: () => {
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
    },
  });
}

export function useReorderChecklistItems(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const queryClient = useQueryClient();
  const queryKey = checklistKeys.scope(planId ?? '', scope);

  return useMutation<
    void,
    unknown,
    number[],
    OptimisticChecklistContext
  >({
    mutationFn: itemIds =>
      reorderChecklistItems(planId as string, scope, itemIds),
    onMutate: async itemIds => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ChecklistItem[]>(queryKey);

      const optimisticItems = queryClient.setQueryData<ChecklistItem[]>(
        queryKey,
        items => {
          const byId = new Map((items ?? []).map(item => [item.itemId, item]));
          return itemIds
            .map((itemId, index) => {
              const item = byId.get(itemId);
              return item ? { ...item, sortOrder: index } : null;
            })
            .filter((item): item is ChecklistItem => !!item);
        },
      );

      return { previousItems, optimisticItems };
    },
    onError: (_error, _variables, context) => {
      if (
        context?.previousItems &&
        queryClient.getQueryData(queryKey) === context.optimisticItems
      ) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },

    onSettled: () => {
      Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
        () => undefined,
      );
    },
  });
}

export function usePlanChecklists(
  planId: string | null | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const {
    subscribeToMessages,
    unsubscribeFromMessages,
    isConnected,
    getCurrentRoomId,
  } = useWebSocket();
  const sharedQuery = useChecklist(planId, 'shared', enabled);
  const personalQuery = useChecklist(planId, 'personal', enabled);

  const isRealtime = !!planId && isConnected && getCurrentRoomId() === planId;

  useEffect(() => {
    if (!planId || !enabled || !subscribeToMessages || !unsubscribeFromMessages) {
      return;
    }

    const handleChecklistMessage = (message: any) => {
      const entity = String(message?.target ?? message?.entity ?? '').toLowerCase();
      if (entity !== 'planchecklistitem') return;

      const event = (message?.data ?? message) as ChecklistSyncEvent;
      const eventPlanId = event.planChecklistItemDtos?.find(item => item.planId)?.planId;

      if (eventPlanId && eventPlanId.toLowerCase() !== planId.toLowerCase()) {
        return;
      }

      const queryKey = checklistKeys.scope(planId, 'shared');
      void queryClient.cancelQueries({ queryKey }, { revert: false });
      queryClient.setQueryData<ChecklistItem[]>(
        queryKey,
        items => applyChecklistSync(items, event),
      );
    };

    subscribeToMessages(handleChecklistMessage);
    return () => unsubscribeFromMessages(handleChecklistMessage);
  }, [enabled, planId, queryClient, subscribeToMessages, unsubscribeFromMessages]);

  const previousRealtimeRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!planId || !enabled) {
      previousRealtimeRef.current = null;
      return;
    }
    if (previousRealtimeRef.current === false && isRealtime) {
      Promise.resolve(
        queryClient.invalidateQueries({
          queryKey: checklistKeys.scope(planId, 'shared'),
        }),
      ).catch(() => undefined);
    }
    previousRealtimeRef.current = isRealtime;
  }, [enabled, isRealtime, planId, queryClient]);

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
    isRealtime,
    isLoading: sharedQuery.isLoading || personalQuery.isLoading,
    isFetching: sharedQuery.isFetching || personalQuery.isFetching,
    isError: sharedQuery.isError || personalQuery.isError,
    error: sharedQuery.error ?? personalQuery.error,
    refetch: () => Promise.all([sharedQuery.refetch(), personalQuery.refetch()]),
  };
}
