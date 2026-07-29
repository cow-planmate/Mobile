import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../../../contexts/AlertContext';
import SocialScreenView from './SocialScreen.view';

export interface Friend {
  id: string;
  nickname: string;
  avatar: string;
}

export interface ChatRoom {
  id: string;
  nickname: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    nickname: '여행하는곰',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
  },
  {
    id: '2',
    nickname: '서울토박이',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
  },
  {
    id: '3',
    nickname: '제주바람',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop',
  },
  {
    id: '4',
    nickname: '맛집사냥꾼',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop',
  },
];

const MOCK_CHATS: ChatRoom[] = [
  {
    id: '1',
    nickname: '여행하는곰',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
    lastMessage: '네, 내일 명동에서 뵐게요!',
    time: '오후 3:45',
    unreadCount: 2,
  },
  {
    id: '2',
    nickname: '서울토박이',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
    lastMessage: '서울 맛집 리스트 공유해주셔서 감사합니다.',
    time: '어제',
  },
];

/**
 * 소셜 친구 목록 및 채팅방 리스트 화면 컨테이너 컴포넌트
 */
export default function SocialScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddFriend = () => {
    showAlert({
      title: '친구 추가',
      message: '새로운 친구 추가 기능은 준비 중입니다.',
    });
  };

  const handleSendMessage = (nickname: string) => {
    showAlert({
      title: '초대 메시지',
      message: `${nickname}님에게 일정 초대 메시지를 전송하시겠습니까?`,
    });
  };

  const handleChat = (nickname: string) => {
    showAlert({
      title: '채팅',
      message: `${nickname}님과의 1:1 대화방을 엽니다.`,
    });
  };

  const handleEditChats = () => {
    showAlert({
      title: '채팅 편집',
      message: '채팅방 목록 편집 기능은 준비 중입니다.',
    });
  };

  const handleViewAllFriends = () => {
    showAlert({
      title: '전체보기',
      message: '전체 친구 목록 조회 화면은 준비 중입니다.',
    });
  };

  // Filter friends based on searchQuery
  const filteredFriends = MOCK_FRIENDS.filter((friend) =>
    friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SocialScreenView
      friends={filteredFriends}
      chats={MOCK_CHATS}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onBack={handleBack}
      onAddFriend={handleAddFriend}
      onSendMessage={handleSendMessage}
      onChat={handleChat}
      onEditChats={handleEditChats}
      onViewAllFriends={handleViewAllFriends}
    />
  );
}
