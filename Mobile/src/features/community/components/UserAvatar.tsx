import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { theme } from '../../../theme/theme';
import { resolveAvatarUrl } from '../utils/avatar';

interface UserAvatarProps {
  /** 이니셜 폴백에 쓰는 닉네임 */
  name?: string | null;
  /** 사용자가 올린 프로필 사진 URL */
  imageUrl?: string | null;
  /** 서버가 내려준 이메일 해시 (Gravatar 식별자) */
  avatarHash?: string | null;
  size?: number;
}

/**
 * 작성자 프로필 아이콘.
 * 프로필 사진 → Gravatar → 닉네임 이니셜 순으로 떨어진다.
 * 이미지 로딩이 실패해도(삭제된 사진, Gravatar 차단 등) 이니셜로 되돌아간다.
 */
export default function UserAvatar({
  name,
  imageUrl,
  avatarHash,
  size = 28,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const uri = resolveAvatarUrl(imageUrl, avatarHash, size * 2);

  const shape = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri && !failed) {
    return (
      <FastImage
        style={shape}
        source={{ uri }}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.fallback, shape]}>
      <Text style={[styles.initial, { fontSize: size * 0.45 }]}>
        {(name || '?').charAt(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
