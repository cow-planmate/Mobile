import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import FallbackImage from '../../../components/common/FallbackImage';
import PopupModal from '../../../components/common/PopupModal';

export interface ParticipantUser {
  uid?: string;
  userNickname?: string;
  userInfo?: { nickname?: string };
  avatarUrl?: string | null;
}

export interface ParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  users: ParticipantUser[];
  /** 로그인한 사용자의 userId — 목록에서 '나'를 짚을 때 쓴다 */
  currentUserId?: string | null;
  isPlanOwner?: boolean;
}

export default function ParticipantsModal({
  visible,
  onClose,
  users,
  currentUserId,
  isPlanOwner = false,
}: ParticipantsModalProps) {
  return (
    <PopupModal
      visible={visible}
      title={`참여자 ${users.length > 0 ? users.length : ''}`.trim()}
      onClose={onClose}
      doneLabel="확인"
    >
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {users.length === 0 ? (
          <Text style={styles.empty}>지금 함께 보고 있는 사람이 없어요</Text>
        ) : (
          users.map((user, idx) => {
            const name =
              user.userNickname || user.userInfo?.nickname || '사용자';
            const isMe =
              !!currentUserId &&
              String(currentUserId).toLowerCase() ===
                String(user.uid || '').toLowerCase();

            return (
              <View key={user.uid || `user-${idx}`} style={styles.row}>
                <FallbackImage
                  uri={user.avatarUrl}
                  style={styles.avatar}
                  fallback={
                    <View style={[styles.avatar, styles.avatarEmpty]}>
                      <Text style={styles.avatarText}>
                        {name.charAt(0) || '?'}
                      </Text>
                    </View>
                  }
                />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {name}
                    {isMe ? ' · 나' : ''}
                    {isMe && isPlanOwner ? ' · 소유자' : ''}
                  </Text>
                  <Text style={styles.status}>지금 보고 있어요</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    paddingVertical: normalize(10),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  avatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
  },
  avatarText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textTertiary,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  status: {
    marginTop: normalize(2),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  empty: {
    paddingVertical: normalize(36),
    textAlign: 'center',
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
});
