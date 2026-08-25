import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  ChecklistItem,
  ChecklistScope,
  ChecklistSyncAction,
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

const CHECKLIST_ACK_TIMEOUT_MS = 5000;

let checklistEventSeq = 0;

const nextChecklistEventId = () =>
  `checklist-${Date.now()}-${(checklistEventSeq += 1)}`;

type ChecklistSendResult = 'skipped' | 'acked' | 'timeout';

export class ChecklistAckTimeoutError extends Error {
  constructor() {
    super('저장 결과를 확인하지 못했어요. 목록을 새로 고칠게요.');
    this.name = 'ChecklistAckTimeoutError';
  }
}

interface ChecklistSyncEvent {
  action?: string;
  planChecklistItemDtos?: PlanChecklistSyncItem[];
}

interface ChecklistTransportResult {
  transport: 'websocket';
}

interface OptimisticChecklistContext {
  previousItems: ChecklistItem[] | undefined;
  cancelledFetch: boolean;
}

const isChecklistTransportResult = (
  value: unknown,
): value is ChecklistTransportResult =>
  typeof value === 'object' &&
  value !== null &&
  'transport' in value &&
  (value as ChecklistTransportResult).transport === 'websocket';

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

const nextSortOrder = (items: ChecklistItem[]) =>
  items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0);

function useSharedChecklistTransport(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const {
    isConnected,
    sendMessage,
    getCurrentRoomId,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useWebSocket();

  return (
    action: ChecklistSyncAction,
    items: PlanChecklistSyncItem[],
  ): Promise<ChecklistSendResult> => {
    if (
      scope !== 'shared' ||
      !planId ||
      !isConnected ||
      getCurrentRoomId() !== planId
    ) {
      return Promise.resolve('skipped');
    }

    const eventId = nextChecklistEventId();

    return new Promise<ChecklistSendResult>(resolve => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const listener = (message: any) => {
        if (settled || message?.eventId !== eventId) return;
        settled = true;
        if (timer) clearTimeout(timer);
        unsubscribeFromMessages(listener);
        resolve('acked');
      };

      subscribeToMessages(listener);

      timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        unsubscribeFromMessages(listener);
        resolve('timeout');
      }, CHECKLIST_ACK_TIMEOUT_MS);

      sendMessage(action, 'planchecklistitem', items, eventId);
    });
  };
}

export function getChecklistErrorMessage(error: unknown): string {

  if (error instanceof ChecklistAckTimeoutError) return error.message;
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
  });
}

function useInvalidateScope(planId: string | null | undefined) {
  const queryClient = useQueryClient();

  return (scope: ChecklistScope) =>
    queryClient.invalidateQueries({
      queryKey: checklistKeys.scope(planId ?? '', scope),
    });
}

export function useCreateChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);
  const queryClient = useQueryClient();
  const sendSharedChecklist = useSharedChecklistTransport(planId, scope);

  return useMutation<number | ChecklistTransportResult, unknown, string>({
    mutationFn: async content => {
      const sharedItems =
        queryClient.getQueryData<ChecklistItem[]>(
          checklistKeys.scope(planId ?? '', 'shared'),
        ) ?? [];
      const sent = await sendSharedChecklist('create', [
        {
          planId: planId as string,
          content,
          isChecked: false,
          sortOrder: nextSortOrder(sharedItems),
        },
      ]);

      if (sent === 'acked') {
        return { transport: 'websocket' } satisfies ChecklistTransportResult;
      }

      if (sent === 'timeout') throw new ChecklistAckTimeoutError();

      return createChecklistItem(planId as string, scope, content);
    },
    onSuccess: result => {
      if (isChecklistTransportResult(result)) return;
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
    },
    onError: error => {
      if (!(error instanceof ChecklistAckTimeoutError)) return;
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
    },
  });
}

export function useEditChecklistItemContent(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);
  const queryClient = useQueryClient();
  const sendSharedChecklist = useSharedChecklistTransport(planId, scope);

  return useMutation<
    void | ChecklistTransportResult,
    unknown,
    { itemId: number; content: string }
  >({
    mutationFn: async ({ itemId, content }) => {
      const currentItem = queryClient
        .getQueryData<ChecklistItem[]>(
          checklistKeys.scope(planId ?? '', 'shared'),
        )
        ?.find(item => item.itemId === itemId);
      const sent = currentItem
        ? await sendSharedChecklist('update', [
            {
              planId: planId as string,
              checklistItemId: itemId,
              content,
              isChecked: currentItem.isChecked,
              sortOrder: currentItem.sortOrder,
            },
          ])
        : 'skipped';

      return sent === 'acked'
        ? ({ transport: 'websocket' } satisfies ChecklistTransportResult)
        : editChecklistItemContent(planId as string, scope, itemId, content);
    },
    onSuccess: result => {
      if (isChecklistTransportResult(result)) return;
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
  const sendSharedChecklist = useSharedChecklistTransport(planId, scope);

  return useMutation<
    void | ChecklistTransportResult,
    unknown,
    { itemId: number; isChecked: boolean },
    OptimisticChecklistContext
  >({
    mutationFn: async ({ itemId, isChecked }) => {
      const currentItem = queryClient
        .getQueryData<ChecklistItem[]>(
          checklistKeys.scope(planId ?? '', 'shared'),
        )
        ?.find(item => item.itemId === itemId);
      const sent = currentItem
        ? await sendSharedChecklist('update', [
            {
              planId: planId as string,
              checklistItemId: itemId,
              content: currentItem.content,
              isChecked,
              sortOrder: currentItem.sortOrder,
            },
          ])
        : 'skipped';

      return sent === 'acked'
        ? ({ transport: 'websocket' } satisfies ChecklistTransportResult)
        : editChecklistItemChecked(planId as string, scope, itemId, isChecked);
    },
    onMutate: async ({ itemId, isChecked }) => {
      const cancelledFetch =
        queryClient.getQueryState(queryKey)?.fetchStatus === 'fetching';
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ChecklistItem[]>(queryKey);

      queryClient.setQueryData<ChecklistItem[]>(queryKey, items =>
        (items ?? []).map(item =>
          item.itemId === itemId ? { ...item, isChecked } : item,
        ),
      );

      return { previousItems, cancelledFetch };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },

    onSettled: (_data, error, _variables, context) => {
      if (error || context?.cancelledFetch) {
        Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
          () => undefined,
        );
      }
    },
  });
}

export function useDeleteChecklistItem(
  planId: string | null | undefined,
  scope: ChecklistScope,
) {
  const invalidateScope = useInvalidateScope(planId);
  const sendSharedChecklist = useSharedChecklistTransport(planId, scope);

  return useMutation<void | ChecklistTransportResult, unknown, number>({
    mutationFn: async itemId => {
      const sent = await sendSharedChecklist('delete', [
        { planId: planId as string, checklistItemId: itemId },
      ]);

      return sent === 'acked'
        ? ({ transport: 'websocket' } satisfies ChecklistTransportResult)
        : deleteChecklistItem(planId as string, scope, itemId);
    },
    onSettled: result => {
      if (isChecklistTransportResult(result)) return;

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
  const sendSharedChecklist = useSharedChecklistTransport(planId, scope);

  return useMutation<
    void | ChecklistTransportResult,
    unknown,
    number[],
    OptimisticChecklistContext
  >({
    mutationFn: async itemIds => {
      const itemsById = new Map(
        (
          queryClient.getQueryData<ChecklistItem[]>(
            checklistKeys.scope(planId ?? '', 'shared'),
          ) ?? []
        ).map(item => [item.itemId, item]),
      );
      const syncItems = itemIds.flatMap((itemId, sortOrder) => {
        const item = itemsById.get(itemId);
        return item
          ? [
              {
                planId: planId as string,
                checklistItemId: item.itemId,
                content: item.content,
                isChecked: item.isChecked,
                sortOrder,
              },
            ]
          : [];
      });
      const sent =
        syncItems.length > 0
          ? await sendSharedChecklist('update', syncItems)
          : 'skipped';

      return sent === 'acked'
        ? ({ transport: 'websocket' } satisfies ChecklistTransportResult)
        : reorderChecklistItems(planId as string, scope, itemIds);
    },
    onMutate: async itemIds => {
      const cancelledFetch =
        queryClient.getQueryState(queryKey)?.fetchStatus === 'fetching';
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

      return { previousItems, cancelledFetch };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },

    onSettled: (_data, error, _variables, context) => {
      if (error || context?.cancelledFetch) {
        Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
          () => undefined,
        );
      }
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

      queryClient.setQueryData<ChecklistItem[]>(
        checklistKeys.scope(planId, 'shared'),
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
