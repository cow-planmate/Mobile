import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WifiOff from 'lucide-react-native/dist/esm/icons/wifi-off';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

interface ProfileOfflineNoticeProps {
  onRetry: () => void;
}

/**
 * 인터넷이 없어 프로필을 아직 못 받았을 때 탭 아래 영역을 채우는 안내.
 *
 * 빈 프로필("사용자 / 이메일 없음")을 보여 주면 데이터가 지워진 것처럼 읽혀서,
 * 상황과 다음 행동만 가운데에 놓는다. 연결이 돌아오면 자동으로 다시 불러온다.
 */
export default function ProfileOfflineNotice({
  onRetry,
}: ProfileOfflineNoticeProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <WifiOff
        size={normalize(32)}
        color={tokens.colors.textMuted}
        strokeWidth={1.8}
      />
      <Text style={styles.title}>인터넷에 연결되어 있지 않아요</Text>
      <Text style={styles.description}>연결되면 자동으로 다시 불러와요.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="다시 시도"
      >
        <Text style={styles.buttonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(tokens.spacing.xl),
    paddingBottom: normalize(64),
    backgroundColor: tokens.colors.white,
  },
  title: {
    marginTop: normalize(tokens.spacing.m),
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  description: {
    marginTop: normalize(tokens.spacing.s),
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
    textAlign: 'center',
  },
  button: {
    marginTop: normalize(tokens.spacing.l),
    minWidth: normalize(140),
    height: normalize(48),
    paddingHorizontal: normalize(tokens.spacing.l),
    borderRadius: normalize(tokens.radius.l),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
  },
  buttonText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
