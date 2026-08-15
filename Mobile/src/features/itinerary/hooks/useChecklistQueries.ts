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

/**
 * 플랜 체크리스트 React Query 훅.
 *
 * 서버는 수정·삭제·정렬 응답에 본문을 주지 않는다. 그래서 성공 응답만으로는 갱신된
 * 값을 알 수 없어, 완료 토글과 순서 변경만 낙관적으로 반영하고(되돌릴 기준이 명확하다)
 * 나머지는 성공 후 다시 조회한다.
 *
 * 공동 목록은 실시간 편집 세션(WebSocket)이 열려 있는 동안 그 경로로 보내고, 되돌아온
 * 브로드캐스트로 목록을 갱신한다. 세션 밖에서는 REST로 보내는데, 서버가 REST 변경을
 * 세션 참여자에게 push하지 않으므로(PlanChecklistService 주석) 그때는 실시간이 아니다.
 */

export const checklistKeys = {
  all: ['checklist'] as const,
  plan: (planId: string) => ['checklist', planId] as const,
  scope: (planId: string, scope: ChecklistScope) =>
    ['checklist', planId, scope] as const,
};

const CHECKLIST_ERROR_FALLBACK = '체크리스트를 저장하지 못했습니다.';

/**
 * 실시간 전송 후 브로드캐스트가 돌아오기를 기다리는 최대 시간(ms).
 *
 * 세션↔룸 매핑이 아직 없으면 WebSocketContext가 메시지를 큐에 담아 두었다가
 * presence 수신(폴백 2초) 시점에 흘려보낸다. 그 대기까지 덮도록 넉넉히 잡는다.
 */
const CHECKLIST_ACK_TIMEOUT_MS = 5000;

let checklistEventSeq = 0;

/** 브로드캐스트를 우리 요청과 짝지어 확인하기 위한 식별자. */
const nextChecklistEventId = () =>
  `checklist-${Date.now()}-${(checklistEventSeq += 1)}`;

/**
 * 실시간 전송 결과.
 * - skipped: 실시간 경로 자체를 쓰지 않았다(개인 목록·미연결·다른 방). REST로 보내면 된다.
 * - acked: 서버가 처리해 브로드캐스트를 돌려줬다.
 * - timeout: 보냈지만 확인하지 못했다. 서버에 닿았는지 알 수 없다.
 */
type ChecklistSendResult = 'skipped' | 'acked' | 'timeout';

/**
 * 실시간으로 보냈으나 결과를 확인하지 못한 경우.
 *
 * STOMP publish에는 응답이 없고 서버는 세션↔룸 매핑이 없는 메시지를 조용히 버린다.
 * 성공으로 처리하면 저장되지 않은 편집이 저장된 것처럼 보이므로 실패로 끊는다.
 */
export class ChecklistAckTimeoutError extends Error {
  constructor() {
    super('저장 결과를 확인하지 못했어요. 목록을 새로 고칩니다.');
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
  if (!currentItems) return currentItems;

  const action = String(event.action ?? '').toLowerCase();
  const nextItems = [...currentItems];

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

/**
 * 새 항목의 sortOrder.
 *
 * 개수를 그대로 쓰면 삭제로 비어 있는 번호 때문에 기존 항목과 값이 겹친다.
 * 서버 캐시 조회(readFromCache)는 sortOrder만으로 정렬해 2차 기준이 없으므로,
 * 값이 겹치면 기기마다 순서가 달라 보인다. 최댓값 다음 번호를 쓴다.
 */
const nextSortOrder = (items: ChecklistItem[]) =>
  items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0);

/**
 * 공동 목록 변경을 실시간 경로로 보낸다.
 *
 * 전송 대상 방은 인자가 아니라 WebSocketContext가 현재 붙어 있는 방으로 정해지므로,
 * 다른 일정에 연결된 상태라면 보내지 않고 REST로 넘긴다. 보낸 뒤에는 같은 eventId가
 * 실린 브로드캐스트가 돌아오는 것을 성공 근거로 삼는다 — publish 자체에는 응답이 없고
 * 서버는 권한 없는 메시지를 조용히 버리기 때문이다.
 */
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

/** 조회 실패·저장 실패 시 화면에 그대로 띄울 수 있는 문구를 만든다. */
export function getChecklistErrorMessage(error: unknown): string {
  // 서버 응답이 없는 실패라 getDisplayErrorMessage는 기본 문구로 떨어진다.
  // 무엇이 불확실한지 알려야 사용자가 목록을 다시 확인한다.
  if (error instanceof ChecklistAckTimeoutError) return error.message;
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
    refetchOnMount: 'always',
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
      // 추가만은 REST로 다시 보내지 않는다. 실시간 요청이 뒤늦게 처리되면
      // 같은 항목이 두 개 남는다. 목록만 서버 기준으로 맞추고 실패로 알린다.
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

/** 항목 내용 수정 */
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

      // 수정은 같은 값을 다시 써도 결과가 같으므로, 확인하지 못하면 REST로 한 번 더 보낸다.
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
    // 성공 시에는 재조회하지 않는다. 낙관적으로 넣은 값이 곧 우리가 보낸 값이라
    // 서버 기준과 다를 수 없고, 체크는 연달아 누르는 조작이라 탭마다 GET이 붙으면
    // 요청 수가 배로 늘어난다. 다만 onMutate가 진행 중이던 조회를 끊었다면 그
    // 응답은 영영 오지 않으므로, 그때는 끊긴 조회를 대신해 다시 맞춰야 한다.
    onSettled: (_data, error, _variables, context) => {
      if (error || context?.cancelledFetch) {
        Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
          () => undefined,
        );
      }
    },
  });
}

/** 항목 삭제 */
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

      // 삭제도 두 번 반영해도 결과가 같으므로 확인하지 못하면 REST로 마무리한다.
      return sent === 'acked'
        ? ({ transport: 'websocket' } satisfies ChecklistTransportResult)
        : deleteChecklistItem(planId as string, scope, itemId);
    },
    onSettled: result => {
      if (isChecklistTransportResult(result)) return;
      // 이미 삭제된 항목(404)이어도 목록을 서버 기준으로 다시 맞춘다.
      Promise.resolve(invalidateScope(scope)).catch(() => undefined);
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
    // 토글과 같은 이유로 성공 경로에서는 재조회하지 않는다. 보낸 순서가 곧 결과다.
    onSettled: (_data, error, _variables, context) => {
      if (error || context?.cancelledFetch) {
        Promise.resolve(queryClient.invalidateQueries({ queryKey })).catch(
          () => undefined,
        );
      }
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
  const queryClient = useQueryClient();
  const {
    subscribeToMessages,
    unsubscribeFromMessages,
    isConnected,
    getCurrentRoomId,
  } = useWebSocket();
  const sharedQuery = useChecklist(planId, 'shared', enabled);
  const personalQuery = useChecklist(planId, 'personal', enabled);

  /** 이 목록이 지금 실시간으로 오가는 중인지. 아니면 REST라 다른 기기에 전달되지 않는다. */
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
      // 서버는 UUID를 소문자로 직렬화하지만 planId의 출처가 여럿이라 대소문자를 맞춰 비교한다.
      if (eventPlanId && eventPlanId.toLowerCase() !== planId.toLowerCase()) {
        return;
      }

      // 여기서 재조회하지 않는다. 이벤트마다 GET이 한 번씩 붙을 뿐 아니라,
      // 그 응답이 늦게 도착하면 사이에 받은 더 새로운 이벤트를 옛 스냅샷으로
      // 덮어써 방금 반영한 변경이 화면에서 되돌아간다.
      queryClient.setQueryData<ChecklistItem[]>(
        checklistKeys.scope(planId, 'shared'),
        items => applyChecklistSync(items, event),
      );
    };

    subscribeToMessages(handleChecklistMessage);
    return () => unsubscribeFromMessages(handleChecklistMessage);
  }, [enabled, planId, queryClient, subscribeToMessages, unsubscribeFromMessages]);

  /**
   * 끊겨 있던 동안의 변경은 브로드캐스트로 오지 않는다. 다시 붙는 순간 한 번 맞춘다.
   * 최초 관측은 전이가 아니므로 건너뛴다(조회는 useChecklist가 이미 한다).
   */
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
