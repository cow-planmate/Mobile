import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import { tokens } from '../../theme/tokens';

export const TOP_BAR_METRICS = {
  height: 56,
  horizontalPadding: 16,
  actionSize: 48,
  titleFontSize: 17,
  titleLineHeight: 24,
} as const;

interface BackTopBarProps {
  title: string;
  onBack: () => void;
  backDisabled?: boolean;
  right?: ReactNode;
}

const BackTopBar = ({
  title,
  onBack,
  backDisabled = false,
  right,
}: BackTopBarProps) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBack}
      disabled={backDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      accessibilityState={{ disabled: backDisabled }}
    >
      <ChevronLeft size={24} color={tokens.colors.text} />
    </TouchableOpacity>

    <View pointerEvents="none" style={styles.titleWrap}>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </View>

    <View style={styles.rightSlot}>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: TOP_BAR_METRICS.height,
    paddingHorizontal: 8,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: TOP_BAR_METRICS.actionSize,
    height: TOP_BAR_METRICS.actionSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: TOP_BAR_METRICS.horizontalPadding + TOP_BAR_METRICS.actionSize,
    right: TOP_BAR_METRICS.horizontalPadding + TOP_BAR_METRICS.actionSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TOP_BAR_METRICS.titleFontSize,
    lineHeight: TOP_BAR_METRICS.titleLineHeight,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  rightSlot: {
    width: TOP_BAR_METRICS.actionSize,
    height: TOP_BAR_METRICS.actionSize,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default BackTopBar;
