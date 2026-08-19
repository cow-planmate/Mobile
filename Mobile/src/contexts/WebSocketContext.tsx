import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Client, IMessage, ReconnectionTimeMode } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import FastImage from 'react-native-fast-image';

import gravatarUrl from '../utils/gravatarUrl';
import { resolveApiUrl } from '../utils/apiUrl';
import { ensureFreshAccessToken } from '../api/axiosConfig';
import { createPlanChecklistSyncMessage } from '../api/checklist';

declare var global: any;

const TextEncoding = require('text-encoding');
Object.assign(global as any, {
  TextEncoder: TextEncoding.TextEncoder,
  TextDecoder: TextEncoding.TextDecoder,
});

const ROOM_READY_FALLBACK_MS = 2000;

const DISCONNECT_TIMEOUT_MS = 300;

// 연결이 오래 끊겨 있어도 큐가 무한정 자라지 않도록 상한을 둔다.
const MAX_QUEUED_MESSAGES = 500;

const MAX_PREFETCHED_AVATARS = 200;

const wsLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

interface UserPresence {
  uid: string;
  userNickname: string;
  avatarUrl?: string;
  userInfo?: {
    email?: string;
    nickname?: string;
  };
}

interface PresenceMessage {
  action: 'create' | 'delete';
  uid: string;
  userNickname: string;
  users: UserPresence[];
}

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: UserPresence[];
  connect: (planId: string) => void;
  disconnect: () => void;

  getCurrentRoomId: () => string | null;
  sendMessage: (
    action: string,
    targetName: string,
    target: any,
    eventId?: string,
  ) => void;
  subscribeToMessages: (callback: (msg: any) => void) => void;
  unsubscribeFromMessages: (callback: (msg: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType,
);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const stompClient = useRef<Client | null>(null);
  const activeSocket = useRef<any>(null);
  const currentPlanId = useRef<string | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const messageListeners = useRef<Set<(msg: any) => void>>(new Set());
  const messageQueue = useRef<
    Array<{
      planId: string;
      action: string;
      targetName: string;
      target: any;
      eventId?: string;
    }>
  >([]);

  const isRoomReadyRef = useRef<boolean>(false);
  const readyFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectGenerationRef = useRef(0);

  const prefetchedAvatarsRef = useRef<Set<string>>(new Set());

  // disconnect가 currentPlanId를 비운 뒤에도 도착하는 지연 전송을 원래 방에
  // 귀속시키기 위해 마지막으로 접속한 방을 따로 남긴다.
  const lastPlanIdRef = useRef<string | null>(null);

  const markRoomReady = useCallback((client: Client, planId: string) => {
    if (readyFallbackTimer.current) {
      clearTimeout(readyFallbackTimer.current);
      readyFallbackTimer.current = null;
    }
    if (isRoomReadyRef.current) return;
    isRoomReadyRef.current = true;

    if (messageQueue.current.length === 0) return;
    const queued = messageQueue.current.filter(msg => msg.planId === planId);
    messageQueue.current = messageQueue.current.filter(
      msg => msg.planId !== planId,
    );
    if (queued.length === 0) return;
    wsLog(`[WS] Flushing ${queued.length} queued messages`);
    queued.forEach(msg => {
      sendMessageInternal(
        client,
        planId,
        msg.action,
        msg.targetName,
        msg.target,
        msg.eventId,
      );
    });
  }, []);

  const getCurrentRoomId = useCallback(() => currentPlanId.current, []);

  const subscribeToMessages = useCallback((callback: (msg: any) => void) => {
    messageListeners.current.add(callback);
  }, []);

  const unsubscribeFromMessages = useCallback((callback: (msg: any) => void) => {
    messageListeners.current.delete(callback);
  }, []);

  const notifyListeners = (message: any) => {
    messageListeners.current.forEach(listener => listener(message));
  };

  const connect = useCallback(async (planId: string) => {
    if (isConnectingRef.current && currentPlanId.current === planId) {
      return;
    }
    if (stompClient.current && stompClient.current.active) {
      if (currentPlanId.current === planId) return; 
      disconnect();
    }

    // 다른 방으로 옮기면 이전 방 앞으로 쌓인 미전송분은 버린다.
    messageQueue.current = messageQueue.current.filter(
      msg => msg.planId === planId,
    );

    const generation = ++connectGenerationRef.current;

    isConnectingRef.current = true;
    isRoomReadyRef.current = false;
    currentPlanId.current = planId;
    lastPlanIdRef.current = planId;
    setOnlineUsers([]);

    const token = await ensureFreshAccessToken();

    if (generation !== connectGenerationRef.current) {
      return;
    }

    const latestTokenRef = { current: token };

    const client = new Client({

      webSocketFactory: () => {
        const wsUrl = latestTokenRef.current
          ? resolveApiUrl(`/ws?token=${encodeURIComponent(latestTokenRef.current)}`)
          : resolveApiUrl('/ws');
        const socket = new SockJS(wsUrl);
        activeSocket.current = socket;
        return socket;
      },
      beforeConnect: async c => {
        latestTokenRef.current = await ensureFreshAccessToken();
        c.connectHeaders = latestTokenRef.current
          ? { Authorization: `Bearer ${latestTokenRef.current}` }
          : {};
      },
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: __DEV__
        ? str => {
            console.log('[WS Debug]', str);
          }
        : () => {},

      reconnectDelay: 3000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      maxReconnectDelay: 30000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: frame => {
        isConnectingRef.current = false;
        wsLog('WebSocket Connected:', frame);
        setIsConnected(true);

        const topics = [`/topic/${planId}`];

        topics.forEach(topic => {
          client.subscribe(topic, (message: IMessage) => {
            try {
              const body = JSON.parse(message.body);
              wsLog(`[Data Recv] ${topic}:`, body);

              const entity = body.entity;
              const action = body.action;

              notifyListeners({
                type: action,
                target: entity,
                data: body,
                eventId: body.eventId,
              });
            } catch (e) {
              console.error('Failed to parse message:', e);
            }
          });
        });

        client.subscribe(
          `/topic/plan-presence/${planId}`,
          (message: IMessage) => {
            try {
              const payload: PresenceMessage = JSON.parse(message.body);
              wsLog('[Presence]:', payload);

              if (payload.users) {

                const normalized = payload.users.map(u => {
                  const rawUid = u.uid || (u as any).userId || (u as any).id || '';
                  const uidStr = String(rawUid).toLowerCase();
                  const nicknameStr =
                    u.userNickname ||
                    u.userInfo?.nickname ||
                    (u as any).nickname ||
                    '참여자';
                  const email = u.userInfo?.email || (u as any).email;
                  const url = email ? gravatarUrl(email) : undefined;

                  if (url && !prefetchedAvatarsRef.current.has(url)) {
                    if (
                      prefetchedAvatarsRef.current.size >= MAX_PREFETCHED_AVATARS
                    ) {
                      const oldest = prefetchedAvatarsRef.current
                        .values()
                        .next().value;
                      if (oldest !== undefined) {
                        prefetchedAvatarsRef.current.delete(oldest);
                      }
                    }
                    prefetchedAvatarsRef.current.add(url);
                    FastImage.preload([{ uri: url }]);
                  }
                  return {
                    ...u,
                    uid: uidStr,
                    userNickname: nicknameStr,
                    avatarUrl: url,
                    userInfo: {
                      nickname: nicknameStr,
                      email: email,
                    },
                  };
                });
                setOnlineUsers(normalized);
              }

              markRoomReady(client, planId);
            } catch (e) {
              console.error('Failed to parse presence message:', e);
            }
          },
        );

        if (readyFallbackTimer.current) {
          clearTimeout(readyFallbackTimer.current);
        }
        readyFallbackTimer.current = setTimeout(() => {
          markRoomReady(client, planId);
        }, ROOM_READY_FALLBACK_MS);
      },
      onStompError: frame => {
        isConnectingRef.current = false;
        console.error('Broker reported error: ' + frame.headers.message);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        isConnectingRef.current = false;
        wsLog('WebSocket Connection Closed');
        setIsConnected(false);

        isRoomReadyRef.current = false;
        if (readyFallbackTimer.current) {
          clearTimeout(readyFallbackTimer.current);
          readyFallbackTimer.current = null;
        }
      },
    });

    client.activate();
    stompClient.current = client;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {

    connectGenerationRef.current += 1;
    isConnectingRef.current = false;
    isRoomReadyRef.current = false;
    if (readyFallbackTimer.current) {
      clearTimeout(readyFallbackTimer.current);
      readyFallbackTimer.current = null;
    }

    const client = stompClient.current;
    const socket = activeSocket.current;
    stompClient.current = null;
    activeSocket.current = null;

    if (client) {

      const hardClose = setTimeout(() => {
        try {
          socket?.close();
        } catch (e) {
          console.warn('[WS] Failed to close active socket:', e);
        }
      }, DISCONNECT_TIMEOUT_MS);

      Promise.resolve(client.deactivate())
        .catch(e => {
          console.warn('[WS] Graceful deactivate failed:', e);
        })
        .finally(() => {
          clearTimeout(hardClose);
          try {
            socket?.close();
          } catch (e) {
            console.warn('[WS] Failed to close active socket:', e);
          }
        });
    } else if (socket) {
      try {
        socket.close();
      } catch (e) {
        console.warn('[WS] Failed to close active socket:', e);
      }
    }

    setIsConnected(false);
    setOnlineUsers([]);
    currentPlanId.current = null;

  }, []);

  const sendMessageInternal = (
    client: Client,
    planId: string | number,
    action: string,
    targetName: string,
    target: any,
    eventId?: string,
  ) => {
    if (!client || !client.connected) {
      console.warn('[WS] Cannot publish — STOMP client is not connected.');
      return;
    }

    let payload: any = {};
    const destination = `/app/${planId}`;

    if (action === 'undo' || action === 'redo') {
      client.publish({
        destination,
        body: JSON.stringify({ action }),
      });
      return;
    }

    switch (targetName) {
      case 'timetableplaceblock':
        payload = {
          entity: 'timetableplaceblock',
          action: action,
          timeTablePlaceBlockDtos: Array.isArray(target) ? target : [target],
        };
        break;
      case 'timetable':
        payload = {
          entity: 'timetable',
          action: action,
          timeTableDtos: Array.isArray(target) ? target : [target],
        };
        break;
      case 'plan':
        payload = {
          entity: 'plan',
          action: action,
          planDtos: Array.isArray(target) ? target : [target],
        };
        break;
      case 'planchecklistitem':
        payload = createPlanChecklistSyncMessage(action as 'create' | 'update' | 'delete', target);
        break;
      default:
        payload = {
          entity: targetName,
          action: action,
          target,
        };
    }

    if (eventId) {
      payload.eventId = eventId;
    } else {
      payload.eventId = `app-auto-${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;
    }

    wsLog(`[WS Send] Dest: ${destination}`, JSON.stringify(payload));

    client.publish({
      destination: destination,
      body: JSON.stringify(payload),
    });
  };

  const sendMessage = useCallback((
    action: string,
    targetName: string,
    target: any,
    eventId?: string,
  ) => {
    const planId = currentPlanId.current;
    const client = stompClient.current;

    if (!client || !client.connected || !planId || !isRoomReadyRef.current) {
      // disconnect 직후 도착한 지연 전송은 currentPlanId가 비어 있으므로
      // 마지막 접속 방으로 귀속시킨다. 귀속할 방이 없으면 버린다.
      const targetPlanId = planId ?? lastPlanIdRef.current;
      if (!targetPlanId) {
        wsLog('[WS] Dropping message — no room to attribute:', action, targetName);
        return;
      }
      wsLog('[WS] Room not ready — queuing message:', action, targetName);
      messageQueue.current.push({
        planId: targetPlanId,
        action,
        targetName,
        target,
        eventId,
      });
      if (messageQueue.current.length > MAX_QUEUED_MESSAGES) {
        const dropped = messageQueue.current.length - MAX_QUEUED_MESSAGES;
        messageQueue.current = messageQueue.current.slice(dropped);
        console.warn(`[WS] Queue overflow — dropped ${dropped} oldest messages.`);
      }
      return;
    }

    sendMessageInternal(client, planId, action, targetName, target, eventId);
  }, []);

  useEffect(() => {

    return () => {
      disconnect();
    };
  }, [disconnect]);

  const contextValue = useMemo(() => ({
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    getCurrentRoomId,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  }), [
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    getCurrentRoomId,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
