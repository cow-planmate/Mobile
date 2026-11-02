import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  /**
   * 화면 맨 위에 놓일 때 켠다. 상태바 자리까지 상단바 색(흰색)으로 채워서
   * 화면 배경이 회색이어도 상태바 뒤가 회색으로 비치지 않는다.
   */
  safeTop?: boolean;
}

const BackTopBar = ({
  title,
  onBack,
  backDisabled = false,
  right,
  safeTop = false,
}: BackTopBarProps) => {
  const insets = useSafeAreaInsets();
  const topInset = safeTop ? insets.top : 0;

  return (
    <View
      style={[
        styles.container,
        topInset > 0 && {
          height: TOP_BAR_METRICS.height + topInset,
          paddingTop: topInset,
        },
      ]}
    >
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

      <View pointerEvents="none" style={[styles.titleWrap, { top: topInset }]}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
};

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
  // 고정 폭이면 "등록"처럼 글자가 든 단추가 48dp 안에 눌려 줄이 꺾인다.
  rightSlot: {
    minWidth: TOP_BAR_METRICS.actionSize,
    height: TOP_BAR_METRICS.actionSize,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default BackTopBar;
