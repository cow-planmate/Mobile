import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import { COLORS, FONTS, RADIUS } from '../authTokens';
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
      <AlertCircle size={sf(17)} color={COLORS.error} />
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
    alignItems: 'center',
    gap: sf(9),
    marginBottom: sf(20),
    paddingVertical: sf(11),
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
    fontSize: sp(13.5),
    fontFamily: FONTS.medium,
    lineHeight: sp(18),
    letterSpacing: -0.2,
  },
});
