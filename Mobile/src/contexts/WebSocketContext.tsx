import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createProtoSyncClient, ProtoSyncClient } from './protoSyncClient';
import FastImage from 'react-native-fast-image';

import gravatarUrl from '../utils/gravatarUrl';
import { resolveApiUrl } from '../utils/apiUrl';
import { ensureFreshAccessToken } from '../api/axiosConfig';
import { createPlanChecklistSyncMessage } from '../api/checklist';

const ROOM_READY_FALLBACK_MS = 2000;


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
  const stompClient = useRef<ProtoSyncClient | null>(null);
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

  /** 서버가 준 접속자 목록을 화면이 쓰는 모양으로 맞추고 아바타를 미리 받아 둔다. */
  const normalizePresenceUsers = useCallback((users: any[]) => {
    return users.map(u => {
      const rawUid = u.uid || u.userId || u.id || '';
      const uidStr = String(rawUid).toLowerCase();
      const nicknameStr =
        u.userNickname || u.userInfo?.nickname || u.nickname || '참여자';
      const email = u.userInfo?.email || u.email;
      const url = email ? gravatarUrl(email) : undefined;

      if (url && !prefetchedAvatarsRef.current.has(url)) {
        if (prefetchedAvatarsRef.current.size >= MAX_PREFETCHED_AVATARS) {
          const oldest = prefetchedAvatarsRef.current.values().next().value;
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
        userInfo: { nickname: nicknameStr, email },
      };
    });
  }, []);

  const markRoomReady = useCallback((client: ProtoSyncClient, planId: string) => {
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

    const client = createProtoSyncClient({
      baseUrl: resolveApiUrl(''),
      token: token ?? '',
      roomId: String(planId),
      onLog: wsLog,

      onConnect: () => {
        if (generation !== connectGenerationRef.current) return;
        isConnectingRef.current = false;
        wsLog('[proto] 방 입장 완료:', planId);
        setIsConnected(true);

        // presence가 늦게 오거나 혼자 있는 방이면 안 올 수도 있다. 큐를 붙잡아 두지 않는다.
        if (readyFallbackTimer.current) {
          clearTimeout(readyFallbackTimer.current);
        }
        readyFallbackTimer.current = setTimeout(() => {
          if (generation !== connectGenerationRef.current) return;
          markRoomReady(client, planId);
        }, ROOM_READY_FALLBACK_MS);
      },

      onSync: (body: any) => {
        if (generation !== connectGenerationRef.current) return;
        wsLog('[Data Recv]', body);
        notifyListeners({
          type: body.action,
          target: body.entity,
          data: body,
          eventId: body.eventId,
        });
      },

      onPresence: (payload: any) => {
        if (generation !== connectGenerationRef.current) return;
        wsLog('[Presence]:', payload);
        if (payload?.users) {
          setOnlineUsers(normalizePresenceUsers(payload.users));
        }
        markRoomReady(client, planId);
      },

      onDisconnect: () => {
        if (generation !== connectGenerationRef.current) return;
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

    // proto 클라이언트는 자기 소켓을 직접 닫는다. 예전 SockJS처럼 밖에서 붙잡을 것이 없다.
    const client = stompClient.current;
    stompClient.current = null;
    try {
      client?.deactivate();
    } catch (e) {
      console.warn('[WS] 소켓 종료 실패:', e);
    }

    setIsConnected(false);
    setOnlineUsers([]);
    currentPlanId.current = null;

  }, []);

  const sendMessageInternal = (
    client: ProtoSyncClient,
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
