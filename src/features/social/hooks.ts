import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchChatRooms,
  fetchFriendRequests,
  fetchFriends,
  fetchMessages,
  removeFriend,
  respondFriendRequest,
  searchUsers,
  sendFriendRequest,
  sendMessage,
} from './api';

const KEYS = {
  all: ['social'] as const,
  friends: ['social', 'friends'] as const,
  requests: ['social', 'friend-requests'] as const,
  rooms: ['social', 'rooms'] as const,
  messages: (roomId: number) => ['social', 'messages', roomId] as const,
};

// shortcut: RN 에는 EventSource 가 없어 웹의 SSE 대신 폴링한다. 푸시(FCM)로 새 쪽지를 받게 되면 바꾼다.
const POLL_MS = 5000;

export const useFriends = () => useQuery({ queryKey: KEYS.friends, queryFn: fetchFriends });
export const useFriendRequests = () => useQuery({ queryKey: KEYS.requests, queryFn: fetchFriendRequests });
export const useChatRooms = () =>
  useQuery({ queryKey: KEYS.rooms, queryFn: fetchChatRooms, refetchInterval: POLL_MS });
export const useUserSearch = (q: string) =>
  useQuery({ queryKey: ['social', 'search', q], queryFn: () => searchUsers(q), enabled: q.length > 0 });
export const useMessages = (roomId?: number) =>
  useQuery({
    queryKey: KEYS.messages(roomId ?? 0),
    queryFn: () => fetchMessages(roomId!),
    enabled: roomId != null,
    refetchInterval: POLL_MS,
  });

export const useSendFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: sendFriendRequest, onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
};

export const useRespondFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) => respondFriendRequest(id, accept),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useRemoveFriend = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: removeFriend, onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.friends }) });
};

export const useSendMessage = (roomId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.messages(roomId ?? 0) });
      qc.invalidateQueries({ queryKey: KEYS.rooms });
    },
  });
};
