import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import EventSource, { MessageEvent } from 'react-native-sse';

import { resolveApiUrl } from '../utils/apiUrl';
import {
  CollaborationRequestResult,
  parseCollaborationRequestResult,
} from '../utils/collaborationRequest';

const DEFAULT_INVITATION_SSE_PATH = '/api/sse/subscribe';

/**
 * 개발 전용 로그.
 *
 * 연결이 불안정하면 error/close 핸들러와 지수 백오프 재연결이 반복되며
 * 로그가 계속 쌓인다. RN에서 console.log는 브리지를 타므로 릴리스에서는 끈다.
 */
const sseLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};
const INITIAL_RECONNECT_DELAY_MS = 1000;
/** 중복 처리 방지용으로 기억해 둘 이벤트 ID 개수 상한 */
const SEEN_EVENT_ID_LIMIT = 200;
const MAX_RECONNECT_DELAY_MS = 30000;
/** 내가 보낸 요청의 처리 결과. 목록 갱신이 아니라 그 자리에서 알려야 한다. */
const REQUEST_RESULT_EVENT = 'requestResult';

const CUSTOM_EVENT_TYPES = [
  'invitation',
  'invite',
  'collaboration-request',
  'notification',
  REQUEST_RESULT_EVENT,
] as const;
type InvitationCustomEvent = (typeof CUSTOM_EVENT_TYPES)[number];

interface UseInvitationSseParams {
  enabled: boolean;
  onInvitationEvent: () => void | Promise<void>;
  /** 내가 보낸 초대·편집 권한 요청이 수락/거절됐을 때 */
  onRequestResult?: (result: CollaborationRequestResult) => void;
}

const resolveSseUrl = (): string => {
  const baseUrl =
    typeof axios.defaults.baseURL === 'string' ? axios.defaults.baseURL : '';

  return resolveApiUrl(DEFAULT_INVITATION_SSE_PATH, baseUrl);
};

/**
 * 실시간 일정 초댓장 및 협업 요청 알림을 위한 SSE(Server-Sent Events) 구독 훅
 *
 * @param params enabled 활성화 여부 및 이벤트 수신 콜백 함수
 */
export function useInvitationSse({
  enabled,
  onInvitationEvent,
  onRequestResult,
}: UseInvitationSseParams) {
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const shouldReconnectRef = useRef(false);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const onInvitationEventRef = useRef(onInvitationEvent);
  const onRequestResultRef = useRef(onRequestResult);

  useEffect(() => {
    onInvitationEventRef.current = onInvitationEvent;
  }, [onInvitationEvent]);

  useEffect(() => {
    onRequestResultRef.current = onRequestResult;
  }, [onRequestResult]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();

    if (sourceRef.current) {
      sourceRef.current.removeAllEventListeners();
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, [clearReconnectTimer]);

  const scheduleReconnect = useCallback(
    (connect: () => Promise<void>) => {
      if (!shouldReconnectRef.current) {
        return;
      }

      clearReconnectTimer();
      const delay = reconnectDelayRef.current;

      reconnectTimerRef.current = setTimeout(() => {
        connect().catch(error => {
          sseLog('[SSE] Reconnect attempt failed:', error);
        });
      }, delay);

      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY_MS,
      );
    },
    [clearReconnectTimer],
  );

  const connect = useCallback(async () => {
    disconnect();

    if (!shouldReconnectRef.current) {
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    // 토큰을 읽는 동안 언마운트(또는 비활성화)됐을 수 있다. 그 사이 cleanup이
    // 지나갔다면 sourceRef가 아직 비어 있어서, 여기서 스트림을 새로 열면
    // 아무도 닫을 수 없는 EventSource가 남는다.
    if (!shouldReconnectRef.current) {
      return;
    }

    if (!token) {
      scheduleReconnect(connect);
      return;
    }

    const source = new EventSource<InvitationCustomEvent>(resolveSseUrl(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
      // 스트림 연결 상태를 유지하고 서버 하트비트를 사용하도록 설정
      pollingInterval: 0,
      timeout: 60000,
    });

    const onOpen = () => {
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
      sseLog('[SSE] 초대 스트림에 연결되었습니다.');
      Promise.resolve(onInvitationEventRef.current()).catch(error => {
        sseLog('[SSE] 초대 목록 재동기화 실패:', error);
      });
    };

    const handleIncomingEvent = (event: {
      type?: string;
      data: string | null;
      lastEventId: string | null;
    }) => {
      const eventId = event.lastEventId ?? undefined;
      if (eventId && seenEventIdsRef.current.has(eventId)) {
        return;
      }

      if (eventId) {
        // 장시간 실행 시 무한히 커지지 않도록 오래된 것부터 버린다.
        // (useFcmNotifications의 seenMessageIds와 같은 방식)
        if (seenEventIdsRef.current.size >= SEEN_EVENT_ID_LIMIT) {
          const oldest = seenEventIdsRef.current.values().next().value;
          if (oldest !== undefined) {
            seenEventIdsRef.current.delete(oldest);
          }
        }
        seenEventIdsRef.current.add(eventId);
      }

      const rawData = event.data;
      if (!rawData || rawData === 'ping') {
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(rawData);
      } catch (_error) {
        // JSON 형태가 아닌 하트비트 메시지는 무시합니다.
      }

      // 요청 결과는 서버가 저장하지 않아 다시 조회할 수 없다.
      // 목록을 새로 받는 대신 이 페이로드를 그대로 화면에 넘긴다.
      if (event.type === REQUEST_RESULT_EVENT) {
        const result = parseCollaborationRequestResult(payload);
        if (result) {
          onRequestResultRef.current?.(result);
        }
        return;
      }

      Promise.resolve(onInvitationEventRef.current()).catch(error => {
        sseLog('[SSE] 초대 이벤트 핸들러 실행 실패:', error);
      });
    };

    const onMessage = (event: MessageEvent) => {
      handleIncomingEvent(event);
    };

    const onCustomEvent = (event: unknown) => {
      if (
        typeof event === 'object' &&
        event !== null &&
        'data' in event &&
        'lastEventId' in event
      ) {
        handleIncomingEvent(
          event as {
            type?: string;
            data: string | null;
            lastEventId: string | null;
          },
        );
      }
    };

    const onError = (event: unknown) => {
      const xhrStatus =
        typeof event === 'object' && event !== null && 'xhrStatus' in event
          ? String((event as { xhrStatus: unknown }).xhrStatus)
          : 'unknown';
      const xhrState =
        typeof event === 'object' && event !== null && 'xhrState' in event
          ? String((event as { xhrState: unknown }).xhrState)
          : 'unknown';

      sseLog(
        `[SSE] 초대 스트림 오류: status=${xhrStatus}, state=${xhrState}`,
      );

      // 서버에서 권한을 거부(401/403)한 경우 재연결 시도를 중지하고 폴링 방식에 의존
      if (xhrStatus === '401' || xhrStatus === '403') {
        shouldReconnectRef.current = false;
        disconnect();
        return;
      }

      disconnect();
      scheduleReconnect(connect);
    };

    const onClose = () => {
      sseLog('[SSE] 초대 스트림 연결 끊김. 재연결 시도 중...');
      disconnect();
      scheduleReconnect(connect);
    };


    source.addEventListener('open', onOpen);
    source.addEventListener('message', onMessage);
    source.addEventListener('error', onError);
    source.addEventListener('close', onClose);
    CUSTOM_EVENT_TYPES.forEach(eventType => {
      source.addEventListener(eventType, onCustomEvent);
    });

    sourceRef.current = source;
  }, [disconnect, scheduleReconnect]);

  useEffect(() => {
    shouldReconnectRef.current = enabled;

    if (enabled) {
      connect().catch(error => {
        sseLog('[SSE] Initial connection failed:', error);
      });
      return () => {
        shouldReconnectRef.current = false;
        disconnect();
      };
    }

    disconnect();
    return () => {
      shouldReconnectRef.current = false;
      disconnect();
    };
  }, [connect, disconnect, enabled]);
}
