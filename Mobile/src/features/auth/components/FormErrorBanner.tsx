import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

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
