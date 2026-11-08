import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiUrl';

/** Social 마이크로서비스(친구·1:1 쪽지). Gateway가 /api/social/** 를 넘긴다. 웹 socialApi.ts 와 같은 계약. */
const url = (path: string) => resolveApiUrl(`/api/social${path}`);

export interface SocialUser {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  avatarHash: string | null;
  deleted?: boolean;
}

export interface FriendRequestItem {
  id: number;
  requester: SocialUser;
  createdAt: string;
}

export interface ChatRoom {
  roomId: number;
  partner: SocialUser;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: string;
  content: string | null;
  createdAt: string;
  deleted: boolean;
}

interface Items<T> {
  items: T[];
  totalElements: number;
}

const get = async <T>(path: string) => (await axios.get<T>(url(path))).data;
const post = async <T>(path: string, body?: unknown) => (await axios.post<T>(url(path), body)).data;

export const fetchFriends = () => get<Items<SocialUser>>('/friends');
export const searchUsers = (q: string) => get<Items<SocialUser>>(`/users/search?q=${encodeURIComponent(q)}`);
export const fetchFriendRequests = () => get<Items<FriendRequestItem>>('/friend-requests');
/** 상대가 먼저 보낸 요청이 있으면 서버가 바로 수락하고 ACCEPTED 를 준다 */
export const sendFriendRequest = (addresseeId: string) => post<{ status: string }>('/friend-requests', { addresseeId });
export const respondFriendRequest = (id: number, accept: boolean) =>
  post(`/friend-requests/${id}/${accept ? 'accept' : 'reject'}`);
export const removeFriend = async (userId: string) => {
  await axios.delete(url(`/friends/${userId}`));
};

export const fetchChatRooms = () => get<Items<ChatRoom>>('/chat/rooms?size=50');
/** 같은 상대와의 방이 이미 있으면 그 방을 돌려준다 */
export const openChatRoom = (targetUserId: string) => post<ChatRoom>('/chat/rooms', { targetUserId });
export const fetchMessages = (roomId: number) =>
  get<{ messages: ChatMessage[]; hasMore: boolean }>(`/chat/rooms/${roomId}/messages?size=100`);
export const sendMessage = (roomId: number, content: string) =>
  post<ChatMessage>(`/chat/rooms/${roomId}/messages`, { content });
export const markRoomRead = (roomId: number, lastReadMessageId: number) =>
  post(`/chat/rooms/${roomId}/read`, { lastReadMessageId });
