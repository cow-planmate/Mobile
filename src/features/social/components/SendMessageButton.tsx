import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Mail from 'lucide-react-native/dist/esm/icons/mail';
import { useAuthStore } from '../../../store/useAuthStore';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import type { AppStackParamList } from '../../../navigation/types';

interface MessageTarget {
  userId?: string | null;
  author: string;
  authorImage?: string | null;
  authorAvatarHash?: string | null;
  authorDeleted?: boolean;
}

/** 글·댓글 작성자에게 쪽지 — 로그인했고, 내가 아니고, 탈퇴하지 않은 작성자에게만 보인다 */
export default function SendMessageButton({ target, compact = false }: { target: MessageTarget; compact?: boolean }) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const myUserId = useAuthStore(state => state.user?.userId);
  const { userId } = target;
  if (!myUserId || !userId || target.authorDeleted || userId === myUserId) return null;

  const open = () =>
    navigation.navigate('Chat', {
      userId,
      nickname: target.author,
      profileImageUrl: target.authorImage ?? null,
      avatarHash: target.authorAvatarHash ?? null,
    });

  return compact ? (
    <TouchableOpacity onPress={open} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${target.author}님에게 쪽지 보내기`}>
      <Text style={styles.compactText}>쪽지</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={styles.trigger} onPress={open} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="작성자에게 쪽지 보내기">
      <Mail size={normalize(12)} color={tokens.colors.primary} />
      <Text style={styles.triggerText}>쪽지</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // 옆의 신고하기 단추와 같은 규격이다
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.tones.primary.bg,
  },
  triggerText: { fontSize: normalize(11), fontFamily: tokens.fontFamily.semibold, color: tokens.colors.primary },
  compactText: { fontSize: normalize(12), fontFamily: tokens.fontFamily.medium, color: tokens.colors.primary },
});
