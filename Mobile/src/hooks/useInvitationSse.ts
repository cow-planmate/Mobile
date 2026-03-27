import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import EventSource, { MessageEvent } from 'react-native-sse';

const DEFAULT_INVITATION_SSE_PATH = '/api/collaboration-requests/stream';
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const CUSTOM_EVENT_TYPES = [
  'invitation',
  'invite',
  'collaboration-request',
  'notification',
] as const;
type InvitationCustomEvent = (typeof CUSTOM_EVENT_TYPES)[number];

interface UseInvitationSseParams {
  enabled: boolean;
  onInvitationEvent: () => void | Promise<void>;
}

const resolveSseUrl = (): string => {
  const baseUrl =
    typeof axios.defaults.baseURL === 'string' ? axios.defaults.baseURL : '';
  const normalizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;

  return `${normalizedBaseUrl}${DEFAULT_INVITATION_SSE_PATH}`;
};

export function useInvitationSse({
  enabled,
  onInvitationEvent,
}: UseInvitationSseParams) {
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const shouldReconnectRef = useRef(false);
  const seenEventIdsRef = useRef<Set<string>>(new Set());

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
          console.log('[SSE] Reconnect attempt failed:', error);
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
    if (!token) {
      scheduleReconnect(connect);
      return;
    }

    const source = new EventSource<InvitationCustomEvent>(resolveSseUrl(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
      // Keep the stream open and let server side heartbeat handle liveness.
      pollingInterval: 0,
      timeout: 60000,
    });

    const onOpen = () => {
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
      console.log('[SSE] Invitation stream connected');
    };

    const handleIncomingEvent = (event: {
      data: string | null;
      lastEventId: string | null;
    }) => {
      const eventId = event.lastEventId ?? undefined;
      if (eventId && seenEventIdsRef.current.has(eventId)) {
        return;
      }

      if (eventId) {
        seenEventIdsRef.current.add(eventId);
      }

      const rawData = event.data;
      if (!rawData || rawData === 'ping') {
        return;
      }

      try {
        JSON.parse(rawData);
      } catch (_error) {
        // Non-JSON heartbeat messages are ignored.
      }

      Promise.resolve(onInvitationEvent()).catch(error => {
        console.log('[SSE] Invitation event handler failed:', error);
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
          event as { data: string | null; lastEventId: string | null },
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

      console.log(
        `[SSE] Invitation stream error: status=${xhrStatus}, state=${xhrState}`,
      );

      // If server denies stream access, stop reconnect loop and rely on polling.
      if (xhrStatus === '401' || xhrStatus === '403') {
        shouldReconnectRef.current = false;
        disconnect();
        return;
      }

      disconnect();
      scheduleReconnect(connect);
    };

    const onClose = () => {
      console.log('[SSE] Invitation stream closed. Reconnecting...');
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
  }, [disconnect, onInvitationEvent, scheduleReconnect]);

  useEffect(() => {
    shouldReconnectRef.current = enabled;

    if (enabled) {
      connect().catch(error => {
        console.log('[SSE] Initial connection failed:', error);
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
