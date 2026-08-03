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

/**
 * presence 브로드캐스트를 기다리는 최대 시간(ms).
 * 서버 sharedsync.presence.broadcast-delay 기본값이 1000ms이므로 그보다 넉넉히 잡는다.
 */
const ROOM_READY_FALLBACK_MS = 2000;

/**
 * graceful 종료(DISCONNECT 프레임 전송)를 기다리는 최대 시간(ms).
 * 이 시간을 넘기면 소켓을 강제로 닫는다. RN이 백그라운드로 전환되며
 * JS 스레드가 정지하면 프레임이 나가지 못한 채 남을 수 있다.
 */
const DISCONNECT_TIMEOUT_MS = 1500;

/**
 * 개발 전용 로그.
 *
 * STOMP debug 콜백은 하트비트를 포함한 모든 프레임마다 호출된다(4초 주기 + 편집 이벤트마다).
 * RN에서 console.log는 브리지를 타므로 릴리스 빌드에서 그대로 두면
 * 동시 편집 중 눈에 띄는 프레임 드랍과 불필요한 사용자 데이터 노출로 이어진다.
 */
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
      action: string;
      targetName: string;
      target: any;
      eventId?: string;
    }>
  >([]);
  /**
   * 서버는 presence 채널 SUBSCRIBE를 처리해 세션↔룸 매핑을 등록한 뒤에야
   * /app/{planId} 메시지를 수용하고, 그 전 메시지는 예외 없이 버린다.
   * 매핑 확립 전에는 전송하지 않고 큐에 쌓아 둔다.
   */
  const isRoomReadyRef = useRef<boolean>(false);
  const readyFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * connect() 호출 세대 번호.
   *
   * connect는 토큰 조회를 await하므로, 그 사이에 다른 plan으로 connect가 다시
   * 불리면 두 호출이 모두 await를 통과해 STOMP 클라이언트를 각각 만든다.
   * 먼저 만들어진 클라이언트는 stompClient 참조가 덮어써지며 연결된 채로 누수된다.
   * 세대 번호가 어긋난 뒤늦은 호출은 클라이언트를 만들지 않고 중단한다.
   */
  const connectGenerationRef = useRef(0);
  /** 이미 prefetch한 아바타 URL. presence 브로드캐스트마다 중복 요청하지 않기 위함. */
  const prefetchedAvatarsRef = useRef<Set<string>>(new Set());
  /** 현재 큐에 쌓인 메시지가 속한 planId. 다른 방으로 옮기면 큐를 버리는 판단에 쓴다. */
  const queuedPlanId = useRef<string | null>(null);

  /**
   * 세션↔룸 매핑이 확립된 시점에 큐를 비웁니다. 여러 번 호출되어도 안전합니다.
   */
  const markRoomReady = useCallback((client: Client, planId: string) => {
    if (readyFallbackTimer.current) {
      clearTimeout(readyFallbackTimer.current);
      readyFallbackTimer.current = null;
    }
    if (isRoomReadyRef.current) return;
    isRoomReadyRef.current = true;

    if (messageQueue.current.length === 0) return;
    wsLog(`[WS] Flushing ${messageQueue.current.length} queued messages`);
    const queued = [...messageQueue.current];
    messageQueue.current = [];
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
      if (currentPlanId.current === planId) return; // 이미 같은 방에 연결됨
      disconnect();
    }

    // 다른 방으로 옮겨가는 경우에만 큐를 버린다. 같은 방 재연결이면 미전송분을 살린다.
    if (queuedPlanId.current && queuedPlanId.current !== planId) {
      messageQueue.current = [];
      queuedPlanId.current = null;
    }

    const generation = ++connectGenerationRef.current;

    isConnectingRef.current = true;
    isRoomReadyRef.current = false;
    currentPlanId.current = planId;
    setOnlineUsers([]);

    // Frontend와 동일하게 SockJS URL에 토큰 포함 (JwtHandshakeInterceptor 인증)
    const token = await AsyncStorage.getItem('accessToken');

    // await 사이에 더 최근의 connect가 시작되었으면 이 호출은 폐기한다.
    if (generation !== connectGenerationRef.current) {
      return;
    }

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
      debug: __DEV__
        ? str => {
            console.log('[WS Debug]', str);
          }
        : () => {},
      // 서버가 메시지 처리 중 예외를 만나면 STOMP ERROR 프레임 후 세션을 닫는다(핸들러
      // 예외 처리 미구현). 동시 편집 중 간헐적으로 발생하므로 재연결 지연을 짧게 둔다.
      reconnectDelay: 3000,
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
              wsLog('[Presence]:', payload);

              // "users": [ ... ] 배열로 현재 접속자 목록을 덮어씌움
              if (payload.users) {
                // Normalize: ensure uid/userNickname are present at top level
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
                  // presence는 참여자가 드나들 때마다 전체 목록을 다시 보낸다.
                  // 이미 요청한 아바타를 매번 다시 prefetch하지 않는다.
                  if (url && !prefetchedAvatarsRef.current.has(url)) {
                    prefetchedAvatarsRef.current.add(url);
                    Image.prefetch(url).catch(() => {});
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

              // presence 브로드캐스트 수신 = 서버가 세션↔룸 매핑을 등록했다는 신호
              markRoomReady(client, planId);
            } catch (e) {
              console.error('Failed to parse presence message:', e);
            }
          },
        );

        // presence 브로드캐스트(broadcast-delay 기본 1초)가 유실될 경우의 폴백
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
        // 소켓이 끊기면 서버 세션도 사라진다. 자동 재연결 후에는 새 세션이
        // presence를 다시 구독해 매핑될 때까지 전송을 보류해야 한다.
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
    // 진행 중인 connect가 있다면 뒤늦게 클라이언트를 만들지 못하게 무효화한다.
    connectGenerationRef.current += 1;
    isConnectingRef.current = false;
    isRoomReadyRef.current = false;
    if (readyFallbackTimer.current) {
      clearTimeout(readyFallbackTimer.current);
      readyFallbackTimer.current = null;
    }
    // 참조를 먼저 떼어내 재진입 시 같은 소켓을 두 번 닫지 않도록 한다.
    const client = stompClient.current;
    const socket = activeSocket.current;
    stompClient.current = null;
    activeSocket.current = null;

    if (client) {
      // force: true는 DISCONNECT 프레임을 보내지 않고 소켓을 폐기한다.
      // 그러면 서버가 SessionDisconnectEvent를 즉시 발행하지 못해
      // 다른 참여자의 접속자 목록에서 늦게 사라진다.
      // 정상 종료 시퀀스를 태우되, 프레임 전송이 지연되면 강제로 닫는다.
      const hardClose = setTimeout(() => {
        try {
          socket?.close();
        } catch (e) {
          console.warn('[WS] Failed to close active socket:', e);
        }
      }, DISCONNECT_TIMEOUT_MS);

      // deactivate()는 정상적으로는 Promise를 반환하지만, 테스트 더블 등
      // Promise를 반환하지 않는 구현이 섞여 있을 수 있어 방어적으로 감싼다.
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
    // 큐는 비우지 않는다. 화면 이탈/백그라운드 전환 시 미전송 편집이 사라지면
    // 롤백 경로가 없어 사용자에게는 저장된 것처럼 보인 채 유실된다.
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

    // undo/redo는 서버가 action만 보고 세션별 히스토리를 되감으므로 entity가 없다.
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
    const planId = currentPlanId.current;
    const client = stompClient.current;

    // 연결 여부는 React state(isConnected)가 아니라 클라이언트 실제 상태로 판단한다.
    // state 반영이 한 틱 늦어 실제로는 전송 가능한 메시지가 큐에 갇히는 것을 막는다.
    if (!client || !client.connected || !planId || !isRoomReadyRef.current) {
      wsLog('[WS] Room not ready — queuing message:', action, targetName);
      queuedPlanId.current = planId ?? queuedPlanId.current;
      messageQueue.current.push({ action, targetName, target, eventId });
      return;
    }

    sendMessageInternal(client, planId, action, targetName, target, eventId);
  }, []);

  useEffect(() => {
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
