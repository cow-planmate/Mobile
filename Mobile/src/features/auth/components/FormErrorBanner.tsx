import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

/**
 * 폼 전체에 걸린 오류.
 *
 * 자격 증명 불일치처럼 어느 한 칸의 문제가 아닌 오류를 특정 입력칸 아래에
 * 붙이면, 그 칸만 틀린 것으로 읽힌다. 로그인 실패는 두 칸이 함께 테두리가
 * 붉어지므로 메시지도 두 칸을 아우르는 자리(폼 머리)에 있어야 한다.
 *
 * 칸 하나에 귀속되는 오류는 그 칸 아래 InlineError가 맡는다.
 */
export default function FormErrorBanner({ message }: { message: string }) {
  return (
    <Animated.View
      style={styles.banner}
      entering={FadeInDown.duration(180)}
      exiting={FadeOut.duration(120)}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
    >
      <AlertCircle size={sf(16)} color={COLORS.error} />
      <View style={styles.messageWrap}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sf(8),
    marginBottom: sf(16),
    paddingVertical: sf(12),
    paddingHorizontal: sf(14),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.errorSurface,
  },
  messageWrap: {
    flex: 1,
  },
  message: {
    color: COLORS.error,
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
  },
});
