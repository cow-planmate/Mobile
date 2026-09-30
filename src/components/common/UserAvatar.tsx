import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { tokens } from '../../theme/tokens';
import { resolveAvatarUrl } from '../../features/community/utils/avatar';
import FallbackImage from './FallbackImage';

interface UserAvatarProps {

  name?: string | null;

  imageUrl?: string | null;

  avatarHash?: string | null;
  size?: number;
}

export default function UserAvatar({
  name,
  imageUrl,
  avatarHash,
  size = 28,
}: UserAvatarProps) {
  const uri = resolveAvatarUrl(imageUrl, avatarHash, size * 2);

  const shape = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <FallbackImage
      uri={uri}
      style={shape}
      priority={FastImage.priority.low}
      fallback={
        <View style={[styles.fallback, shape]}>
          <Text style={[styles.initial, { fontSize: size * 0.45 }]}>
            {(name || '?').charAt(0)}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: tokens.colors.white,
    fontFamily: tokens.fontFamily.bold,
  },
});
