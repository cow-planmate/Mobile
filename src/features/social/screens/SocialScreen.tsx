import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Search from 'lucide-react-native/dist/esm/icons/search';
import Mail from 'lucide-react-native/dist/esm/icons/mail';
import UserPlus from 'lucide-react-native/dist/esm/icons/user-plus';
import Users from 'lucide-react-native/dist/esm/icons/users';
import BackTopBar from '../../../components/common/BackTopBar';
import { EmptyState, UnderlineTabs } from '../../../components/ui';
import { useAlert } from '../../../contexts/AlertContext';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import { useAuthStore } from '../../../store/useAuthStore';
import { tokens } from '../../../theme/tokens';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { normalize } from '../../../utils/normalize';
import type { AppStackParamList } from '../../../navigation/types';
import UserAvatar from '../../community/components/UserAvatar';
import PublicProfileModal from '../../community/components/PublicProfileModal';
import { timeAgo } from '../../community/utils/timeAgo';
import type { SocialUser } from '../api';
import {
  useChatRooms,
  useFriendRequests,
  useFriends,
  useRemoveFriend,
  useRespondFriendRequest,
  useSendFriendRequest,
  useUserSearch,
} from '../hooks';
import { styles } from './SocialScreen.styles';

type Tab = 'friends' | 'chats';

/** 친구·받은 요청·쪽지함 — 웹 /social 과 같은 기능 */
export default function SocialScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { showAlert } = useAlert();
  const screenInsets = useScreenInsets();
  const myUserId = useAuthStore(state => state.user?.userId);
  const [tab, setTab] = useState<Tab>('friends');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [profileUser, setProfileUser] = useState<SocialUser | null>(null);

  const friends = useFriends().data?.items ?? [];
  const requests = useFriendRequests().data?.items ?? [];
  const rooms = useChatRooms().data?.items ?? [];
  const search = useUserSearch(query);
  const sendRequest = useSendFriendRequest();
  const respond = useRespondFriendRequest();
  const remove = useRemoveFriend();

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const friendIds = new Set(friends.map(f => f.userId));
  const found = (search.data?.items ?? []).filter(u => u.userId !== myUserId);
  const unread = rooms.reduce((sum, r) => sum + r.unreadCount, 0);

  const fail = (error: unknown) =>
    showAlert({ title: '요청 실패', message: getBackendErrorMessage(error), type: 'error' });

  const openChat = (user: SocialUser) =>
    navigation.navigate('Chat', {
      userId: user.userId,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
      avatarHash: user.avatarHash,
    });

  const handleRequest = (user: SocialUser) =>
    sendRequest.mutateAsync(user.userId).then(
      result =>
        showAlert({
          title: result.status === 'ACCEPTED' ? `${user.nickname}님과 친구가 되었어요` : '친구 요청을 보냈어요',
          type: 'success',
        }),
      fail,
    );

  const handleRemove = (user: SocialUser) =>
    showAlert({
      title: '친구 삭제',
      message: `${user.nickname}님을 친구에서 삭제할까요?`,
      buttons: [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => remove.mutateAsync(user.userId).catch(fail) },
      ],
    });

  const renderUser = (user: SocialUser, right: React.ReactNode, sub?: string) => (
    <View key={user.userId} style={styles.userRow}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => setProfileUser(user)}
        accessibilityRole="button"
        accessibilityLabel={`${user.nickname} 프로필 보기`}
      >
        <UserAvatar name={user.nickname} imageUrl={user.profileImageUrl} avatarHash={user.avatarHash} size={normalize(40)} />
        <View style={styles.userTexts}>
          <Text style={styles.userName} numberOfLines={1}>{user.nickname}</Text>
          {!!sub && <Text style={styles.userSub} numberOfLines={1}>{sub}</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.rowActions}>{right}</View>
    </View>
  );

  const chip = (label: string, onPress: () => void, variant: 'primary' | 'soft' | 'muted' = 'soft', icon?: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.chip, styles[`chip_${variant}`]]}
      onPress={onPress}
      disabled={sendRequest.isPending || respond.isPending || remove.isPending}
      accessibilityRole="button"
    >
      {icon}
      <Text style={[styles.chipText, styles[`chipText_${variant}`]]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, screenInsets]}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />
      <BackTopBar title="친구·쪽지" onBack={() => navigation.goBack()} />
      <UnderlineTabs
        items={[
          { key: 'friends', label: '친구', count: friends.length },
          { key: 'chats', label: '쪽지함', count: unread || undefined },
        ]}
        scrollable={false}
        selectedKey={tab}
        onSelect={key => setTab(key as Tab)}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'friends' ? (
          <>
            <View style={styles.searchBox}>
              <Search size={normalize(16)} color={tokens.colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                value={input}
                onChangeText={setInput}
                placeholder="닉네임으로 친구 찾기"
                placeholderTextColor={tokens.colors.textTertiary}
                accessibilityLabel="닉네임 검색"
              />
            </View>

            {!!query && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>검색 결과</Text>
                {found.length === 0 ? (
                  <Text style={styles.muted}>{search.isFetching ? '찾는 중…' : '일치하는 사용자가 없어요.'}</Text>
                ) : (
                  found.map(user =>
                    renderUser(
                      user,
                      friendIds.has(user.userId)
                        ? <Text style={styles.muted}>친구</Text>
                        : chip('친구 요청', () => handleRequest(user), 'soft', <UserPlus size={normalize(13)} color={tokens.colors.primary} />),
                    ),
                  )
                )}
              </View>
            )}

            {requests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>받은 친구 요청 {requests.length}</Text>
                {requests.map(request =>
                  renderUser(
                    request.requester,
                    <>
                      {chip('수락', () => respond.mutateAsync({ id: request.id, accept: true }).catch(fail), 'primary')}
                      {chip('거절', () => respond.mutateAsync({ id: request.id, accept: false }).catch(fail), 'muted')}
                    </>,
                  ),
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>내 친구 {friends.length}</Text>
              {friends.length === 0 ? (
                <EmptyState
                  title="아직 친구가 없어요"
                  description="닉네임으로 찾아 친구 요청을 보내보세요."
                  icon={<Users size={normalize(28)} color={tokens.colors.textTertiary} />}
                />
              ) : (
                friends.map(friend =>
                  renderUser(
                    friend,
                    <>
                      {chip('쪽지', () => openChat(friend), 'soft', <Mail size={normalize(13)} color={tokens.colors.primary} />)}
                      {chip('삭제', () => handleRemove(friend), 'muted')}
                    </>,
                  ),
                )
              )}
            </View>
          </>
        ) : rooms.length === 0 ? (
          <EmptyState
            title="주고받은 쪽지가 없어요"
            description="게시글 작성자나 친구에게 쪽지를 보내보세요."
            icon={<Mail size={normalize(28)} color={tokens.colors.textTertiary} />}
          />
        ) : (
          rooms.map(room => (
            <TouchableOpacity
              key={room.roomId}
              style={styles.roomRow}
              onPress={() => openChat(room.partner)}
              accessibilityRole="button"
              accessibilityLabel={`${room.partner.nickname}님과의 쪽지`}
            >
              <UserAvatar
                name={room.partner.nickname}
                imageUrl={room.partner.profileImageUrl}
                avatarHash={room.partner.avatarHash}
                size={normalize(44)}
              />
              <View style={styles.userTexts}>
                <View style={styles.roomTop}>
                  <Text style={styles.userName} numberOfLines={1}>{room.partner.nickname}</Text>
                  {!!room.lastMessageAt && <Text style={styles.userSub}>{timeAgo(room.lastMessageAt)}</Text>}
                </View>
                <Text style={styles.userSub} numberOfLines={1}>
                  {room.lastMessage ?? (room.lastMessageAt ? '삭제된 메시지입니다' : '아직 메시지가 없어요')}
                </Text>
              </View>
              {room.unreadCount > 0 && (
                <View style={styles.unread}>
                  <Text style={styles.unreadText}>{room.unreadCount > 99 ? '99+' : room.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <PublicProfileModal
        visible={!!profileUser}
        onClose={() => setProfileUser(null)}
        userId={profileUser?.userId ?? null}
        fallbackName={profileUser?.nickname}
      />
    </View>
  );
}
