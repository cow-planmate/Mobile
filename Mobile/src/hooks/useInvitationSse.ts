import { useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import EventSource, { MessageEvent } from 'react-native-sse';

import { resolveApiUrl } from '../utils/apiUrl';
import { ensureFreshAccessToken, refreshAccessToken } from '../api/axiosConfig';
import {
  CollaborationRequestResult,
  parseCollaborationRequestResult,
} from '../utils/collaborationRequest';

const DEFAULT_INVITATION_SSE_PATH = '/api/sse/subscribe';

const sseLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};
const INITIAL_RECONNECT_DELAY_MS = 1000;

const SEEN_EVENT_ID_LIMIT = 200;
const MAX_RECONNECT_DELAY_MS = 30000;

// 토큰 갱신은 네트워크 장애로도 실패하므로 곧바로 포기하지 않는다.
const MAX_AUTH_RETRIES = 5;

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

  onRequestResult?: (result: CollaborationRequestResult) => void;
}

const resolveSseUrl = (): string => {
  const baseUrl =
    typeof axios.defaults.baseURL === 'string' ? axios.defaults.baseURL : '';

  return resolveApiUrl(DEFAULT_INVITATION_SSE_PATH, baseUrl);
};

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
  const authRetryCountRef = useRef(0);
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

      // error와 close가 연달아 오는 경우가 있어, 이미 예약된 재연결이 있으면
      // 다시 잡지 않는다. 그러지 않으면 백오프가 두 배씩 빨리 늘어난다.
      if (reconnectTimerRef.current) {
        return;
      }

      const delay = reconnectDelayRef.current;

      reconnectTimerRef.current = setTimeout(() => {
        // 발화한 타이머 참조를 비워야 다음 재연결 예약이 막히지 않는다.
        reconnectTimerRef.current = null;
        connect().catch(error => {
          sseLog('[SSE] Reconnect attempt failed:', error);
        });
      }, delay);

      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY_MS,
      );
    },
    [],
  );

  const connect = useCallback(async () => {
    disconnect();

    if (!shouldReconnectRef.current) {
      return;
    }

    const token = await ensureFreshAccessToken();

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

      pollingInterval: 0,
      timeout: 60000,
    });

    const onOpen = () => {
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
      authRetryCountRef.current = 0;
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

      }

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

      if (xhrStatus === '403') {
        shouldReconnectRef.current = false;
        disconnect();
        return;
      }

      if (xhrStatus === '401') {
        disconnect();
        refreshAccessToken().then(newToken => {
          if (!shouldReconnectRef.current) return;
          if (newToken) {
            authRetryCountRef.current = 0;
            reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
            scheduleReconnect(connect);
            return;
          }

          // 갱신 실패는 네트워크 장애로도 발생한다. 몇 차례는 백오프로 다시
          // 시도하고, 계속 실패할 때만 인증 만료로 보고 포기한다.
          authRetryCountRef.current += 1;
          if (authRetryCountRef.current >= MAX_AUTH_RETRIES) {
            sseLog('[SSE] 인증 갱신이 반복 실패해 초대 스트림을 중단합니다.');
            shouldReconnectRef.current = false;
            return;
          }
          scheduleReconnect(connect);
        });
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
    authRetryCountRef.current = 0;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;

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
