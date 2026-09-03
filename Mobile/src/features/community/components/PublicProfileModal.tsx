import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Lock from 'lucide-react-native/dist/esm/icons/lock';
import { normalize } from '../../../utils/normalize';
import { parseBackendError } from '../../../utils/errorHandler';
import { fetchPublicProfile } from '../../../api/user';
import PopupModal from '../../../components/common/PopupModal';
import UserAvatar from '../../../components/common/UserAvatar';
import { tokens } from '../../../theme/tokens';

interface PublicProfileModalProps {
  visible: boolean;
  onClose: () => void;

  userId: string | null;

  fallbackName?: string;
}

const PROFILE_PRIVATE_CODE = 'USER_002';

export default function PublicProfileModal({
  visible,
  onClose,
  userId,
  fallbackName,
}: PublicProfileModalProps) {
  const query = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: ({ signal }) => fetchPublicProfile(userId as string, signal),
    enabled: visible && !!userId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isPrivate =
    query.isError && parseBackendError(query.error).code === PROFILE_PRIVATE_CODE;
  const profile = query.data;

  return (
    <PopupModal
      visible={visible}
      title="프로필"
      onClose={onClose}
      doneLabel="확인"
    >
      {query.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : isPrivate ? (
        <View style={styles.stateBox}>
          <Lock
            size={normalize(28)}
            color={tokens.colors.textTertiary}
            strokeWidth={1.5}
          />
          <Text style={styles.stateTitle}>비공개 프로필이에요</Text>
          <Text style={styles.stateText}>
            {fallbackName ? `${fallbackName}님이 ` : ''}프로필을 공개하지 않았어요.
          </Text>
        </View>
      ) : query.isError || !profile ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>불러오지 못했어요</Text>
          <Text style={styles.stateText}>잠시 후 다시 시도해주세요.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <UserAvatar
            name={profile.nickname}
            imageUrl={profile.profileImageUrl}
            size={normalize(64)}
          />
          <Text style={styles.nickname}>{profile.nickname}</Text>

          <View style={styles.statRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{profile.myPlanCount}</Text>
              <Text style={styles.statLabel}>만든 일정</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{profile.editablePlanCount}</Text>
              <Text style={styles.statLabel}>참여 일정</Text>
            </View>
          </View>

          {profile.preferredThemes.length > 0 && (
            <View style={styles.themeSection}>
              <Text style={styles.themeLabel}>선호 테마</Text>
              <View style={styles.themeList}>
                {profile.preferredThemes.map(t => (
                  <View key={t.preferredThemeId} style={styles.themeTag}>
                    <Text style={styles.themeTagText}>
                      {t.preferredThemeName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(32),
    paddingHorizontal: normalize(16),
    gap: normalize(8),
  },
  stateTitle: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  stateText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  body: {
    alignItems: 'center',
    gap: normalize(10),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    paddingBottom: normalize(8),
  },
  nickname: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
  },
  statBlock: {
    alignItems: 'center',
    paddingHorizontal: normalize(24),
  },
  statDivider: {
    width: 1,
    height: normalize(28),
    backgroundColor: tokens.colors.border,
  },
  statValue: {
    fontSize: normalize(18),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  statLabel: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
    marginTop: normalize(2),
  },
  themeSection: {
    width: '100%',
    marginTop: normalize(8),
  },
  themeLabel: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
    marginBottom: normalize(6),
  },
  themeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
  },
  themeTag: {
    backgroundColor: tokens.colors.borderLight,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  themeTagText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
});
