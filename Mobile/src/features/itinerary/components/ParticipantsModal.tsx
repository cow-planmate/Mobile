import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import UsersIcon from 'lucide-react-native/dist/esm/icons/users';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

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
  /** 로그인한 사용자의 userId — 목록에서 '(나)'를 붙일 때 쓴다 */
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panel} onPress={e => e.stopPropagation()}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderTitleRow}>
              <View style={styles.panelHeaderIcon}>
                <UsersIcon color={tokens.colors.primary} size={18} />
              </View>
              <View>
                <Text style={styles.panelTitle}>참여자</Text>
                <Text style={styles.panelSubtitle}>
                  현재 일정에 참여 중인 사람
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
            >
              <XIcon color={tokens.colors.textTertiary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.participantList}
            contentContainerStyle={styles.participantListContent}
            showsVerticalScrollIndicator={false}
          >
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  현재 참여 중인 사람이 없습니다.
                </Text>
              </View>
            ) : (
              users.map((user, idx) => {
                const name =
                  user.userNickname || user.userInfo?.nickname || '사용자';
                const initial = name.charAt(0) || '?';
                const isMe =
                  !!currentUserId &&
                  String(currentUserId).toLowerCase() ===
                    String(user.uid || '').toLowerCase();

                return (
                  <View
                    key={user.uid || `user-${idx}`}
                    style={styles.participantRow}
                  >
                    <View style={styles.participantAvatar}>
                      {user.avatarUrl ? (
                        <FastImage
                          source={{
                            uri: user.avatarUrl,
                            priority: FastImage.priority.normal,
                          }}
                          style={styles.participantAvatarImage}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      ) : (
                        <Text style={styles.participantAvatarText}>
                          {initial}
                        </Text>
                      )}
                    </View>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantNameRow}>
                        <Text style={styles.participantName}>{name}</Text>
                        {isMe && <Text style={styles.meTag}>(나)</Text>}
                        {isMe && isPlanOwner && (
                          <Text style={styles.ownerTag}>[소유자]</Text>
                        )}
                      </View>
                      <Text style={styles.participantStatus}>
                        현재 일정에 접속 중
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    paddingHorizontal: normalize(16),
  },
  panel: {
    backgroundColor: tokens.colors.white,
    borderRadius: normalize(20),
    padding: normalize(18),
    maxHeight: '78%',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(14),
  },
  panelHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  panelHeaderIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.sub,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  panelSubtitle: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  participantList: {
    flexGrow: 0,
  },
  participantListContent: {
    gap: normalize(10),
    paddingBottom: normalize(6),
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(12),
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  participantAvatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: normalize(12),
  },
  participantAvatarImage: {
    width: '100%',
    height: '100%',
  },
  participantAvatarText: {
    color: tokens.colors.white,
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
  },
  participantInfo: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  participantName: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  meTag: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  ownerTag: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.tones.warning.fg,
  },
  participantStatus: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  emptyState: {
    paddingVertical: normalize(18),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
});
