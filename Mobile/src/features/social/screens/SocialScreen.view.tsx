import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  UserPlus,
  Users,
  MessageSquare,
  Heart,
  Award,
  Search,
  Send,
  ExternalLink,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './SocialScreen.styles';
import { Friend, ChatRoom } from './SocialScreen';

export interface SocialScreenViewProps {
  friends: Friend[];
  chats: ChatRoom[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onBack: () => void;
  onAddFriend: () => void;
  onSendMessage: (nickname: string) => void;
  onChat: (nickname: string) => void;
  onEditChats: () => void;
  onViewAllFriends: () => void;
}

export default function SocialScreenView({
  friends,
  chats,
  searchQuery,
  onSearchChange,
  onBack,
  onAddFriend,
  onSendMessage,
  onChat,
  onEditChats,
  onViewAllFriends,
}: SocialScreenViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* 뒤로가기 버튼 */}
      <View style={styles.topActionHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. 대시보드 헤더 ── */}
        <View style={styles.dashboardHeader}>
          <View style={styles.badgeWrapper}>
            <View style={styles.socialBadge}>
              <Text style={styles.socialBadgeText}>SOCIAL CENTER</Text>
            </View>
          </View>
          
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dashboardTitle}>소셜 대시보드</Text>
              <Text style={styles.dashboardSubtitle}>
                친구들의 소식을 확인하고 새로운 인연을 만들어보세요.
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addFriendButton} 
              onPress={onAddFriend}
              activeOpacity={0.8}
            >
              <UserPlus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addFriendButtonText}>친구 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 2. 4종 대시보드 통계 카드 ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Users size={18} color="#2563EB" />
            </View>
            <Text style={styles.statLabel}>내 친구</Text>
            <Text style={styles.statValue}>4</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
              <MessageSquare size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statLabel}>활성 대화</Text>
            <Text style={styles.statValue}>2</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FDF2F8' }]}>
              <Heart size={18} color="#DB2777" />
            </View>
            <Text style={styles.statLabel}>받은 좋아요</Text>
            <Text style={styles.statValue}>1.2k</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Award size={18} color="#D97706" />
            </View>
            <Text style={styles.statLabel}>소셜 랭킹</Text>
            <Text style={styles.statValue}>TOP 5%</Text>
          </View>
        </View>

        {/* ── 3. 내 친구 카드 ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>내 친구</Text>
              <Text style={styles.cardSubtitle}>전체 4명</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerLinkRow} 
              onPress={onViewAllFriends}
              activeOpacity={0.7}
            >
              <Text style={styles.headerLinkText}>전체보기</Text>
              <ExternalLink size={12} color="#2563EB" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {/* 친구 검색 필드 */}
          <View style={styles.friendSearchContainer}>
            <Search size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.friendSearchInput}
              placeholder="닉네임으로 친구 찾기..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          {/* 친구 목록 리스트 */}
          {friends.length > 0 ? (
            <View style={styles.listContainer}>
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <FastImage
                      style={styles.avatar}
                      source={{ uri: friend.avatar }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text style={styles.friendName}>{friend.nickname}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionIconButton} 
                      onPress={() => onSendMessage(friend.nickname)}
                      activeOpacity={0.8}
                    >
                      <Send size={14} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionIconButton} 
                      onPress={() => onChat(friend.nickname)}
                      activeOpacity={0.8}
                    >
                      <MessageSquare size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>해당 닉네임의 친구가 존재하지 않습니다.</Text>
          )}
        </View>

        {/* ── 4. 최근 채팅 카드 ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>최근 채팅</Text>
              <Text style={styles.cardSubtitle}>대화 중인 방 2개</Text>
            </View>
            <TouchableOpacity onPress={onEditChats} activeOpacity={0.7}>
              <Text style={styles.headerLinkText}>편집</Text>
            </TouchableOpacity>
          </View>

          {/* 채팅방 리스트 */}
          <View style={styles.listContainer}>
            {chats.map((chat) => (
              <TouchableOpacity 
                key={chat.id} 
                style={styles.chatItem}
                onPress={() => onChat(chat.nickname)}
                activeOpacity={0.8}
              >
                <FastImage
                  style={styles.avatar}
                  source={{ uri: chat.avatar }}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.chatContent}>
                  <View style={styles.chatRow}>
                    <Text style={styles.chatName}>{chat.nickname}</Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <View style={styles.chatRow}>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    {chat.unreadCount && chat.unreadCount > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
