import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Image } from 'react-native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

import gravatarUrl from '../utils/gravatarUrl';
import { resolveApiUrl } from '../utils/apiUrl';

declare var global: any;

// React Native Polyfills for StompJS
const TextEncoding = require('text-encoding');
Object.assign(global as any, {
  TextEncoder: TextEncoding.TextEncoder,
  TextDecoder: TextEncoding.TextDecoder,
});

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

// Defined ActionData structure
interface ActionData<T = any> {
  action: string;
  targetName: string;
  target: T;
}

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: UserPresence[];
  connect: (planId: string) => void;
  disconnect: () => void;
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
  const messageListeners = useRef<Set<(msg: any) => void>>(new Set());
  const messageQueue = useRef<
    Array<{
      action: string;
      targetName: string;
      target: any;
      eventId?: string;
    }>
  >([]);

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
    if (stompClient.current && stompClient.current.active) {
      if (currentPlanId.current === planId) return; // 이미 같은 방에 연결됨
      disconnect();
    }

    currentPlanId.current = planId;

    // Frontend와 동일하게 SockJS URL에 토큰 포함 (JwtHandshakeInterceptor 인증)
    const token = await AsyncStorage.getItem('accessToken');
    const wsUrl = token
      ? resolveApiUrl(`/ws?token=${encodeURIComponent(token)}`)
      : resolveApiUrl('/ws');

    const client = new Client({
      // SockJS 지원을 위해 factory 사용
      webSocketFactory: () => {
        const socket = new SockJS(wsUrl);
        activeSocket.current = socket;
        return socket;
      },
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: str => {
        console.log('[WS Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: frame => {
        console.log('WebSocket Connected:', frame);
        setIsConnected(true);

        // Flush queued messages that were sent before connection was established
        if (messageQueue.current.length > 0) {
          console.log(
            `[WS] Flushing ${messageQueue.current.length} queued messages`,
          );
          const queuedMessages = [...messageQueue.current];
          messageQueue.current = [];
          queuedMessages.forEach(msg => {
            // Use setTimeout to ensure subscriptions are set up first
            setTimeout(() => {
              sendMessageInternal(
                client,
                planId,
                msg.action,
                msg.targetName,
                msg.target,
                msg.eventId,
              );
            }, 100);
          });
        }

        const topics = [`/topic/${planId}`];

        topics.forEach(topic => {
          client.subscribe(topic, (message: IMessage) => {
            try {
              const body = JSON.parse(message.body);
              console.log(`[Data Recv] ${topic}:`, body);
              // Web format: { entity: "...", action: "...", ... }
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

        // 2. Presence(접속자) 채널 구독 (/topic/plan-presence/{planId})
        client.subscribe(
          `/topic/plan-presence/${planId}`,
          (message: IMessage) => {
            try {
              const payload: PresenceMessage = JSON.parse(message.body);
              console.log('[Presence]:', payload);

              // "users": [ ... ] 배열로 현재 접속자 목록을 덮어씌움
              if (payload.users) {
                // Normalize: ensure uid/userNickname are present at top level
                const normalized = payload.users.map(u => {
                  const email = u.userInfo?.email;
                  const url = email ? gravatarUrl(email) : undefined;
                  // Prefetch the avatar image for instant display
                  if (url) {
                    Image.prefetch(url).catch(() => {});
                  }
                  return {
                    ...u,
                    uid: u.uid || '',
                    userNickname: u.userNickname || u.userInfo?.nickname || '',
                    avatarUrl: url,
                    userInfo: u.userInfo || { nickname: u.userNickname },
                  };
                });
                setOnlineUsers(normalized);
              }
            } catch (e) {
              console.error('Failed to parse presence message:', e);
            }
          },
        );
      },
      onStompError: frame => {
        console.error('Broker reported error: ' + frame.headers.message);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('WebSocket Connection Closed');
        setIsConnected(false);
      },
    });

    client.activate();
    stompClient.current = client;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      // deactivate({ force: true }) immediately closes the socket connection
      stompClient.current.deactivate({ force: true });
      stompClient.current = null;
    }
    if (activeSocket.current) {
      try {
        console.log('[WS] Force closing active SockJS socket...');
        activeSocket.current.close();
      } catch (e) {
        console.warn('[WS] Failed to close active socket:', e);
      }
      activeSocket.current = null;
    }
    setIsConnected(false);
    setOnlineUsers([]);
    currentPlanId.current = null;
    messageQueue.current = [];
  }, []);

  /**
   * Internal message sending logic (used by sendMessage and queue flush)
   */
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

    console.log(`[WS Send] Dest: ${destination}`, JSON.stringify(payload));

    client.publish({
      destination: destination,
      body: JSON.stringify(payload),
    });
  };

  /**
   * 공통 요청 구조에 맞춘 메시지 전송
   * WebSocket이 아직 연결되지 않았으면 큐에 추가하고 연결 후 자동 전송
   */
  const sendMessage = useCallback((
    action: string,
    targetName: string,
    target: any,
    eventId?: string,
  ) => {
    if (!stompClient.current || !stompClient.current.connected || !isConnected || !currentPlanId.current) {
      console.warn(
        '[WS] Not connected yet — queuing message:',
        action,
        targetName,
      );
      messageQueue.current.push({ action, targetName, target, eventId });
      return;
    }

    sendMessageInternal(
      stompClient.current,
      currentPlanId.current,
      action,
      targetName,
      target,
      eventId,
    );
  }, [isConnected]);

  useEffect(() => {
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnect();
    };
  }, []);

  const contextValue = useMemo(() => ({
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  }), [
    isConnected,
    onlineUsers,
    connect,
    disconnect,
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
