import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/** 프로필 탭 행 목록 위에 작게 올리는 구역 이름. */
export function ProfileMenuLabel({ title }: { title: string }) {
  return (
    <Text style={styles.label} accessibilityRole="header">
      {title}
    </Text>
  );
}

interface ProfileMenuRowProps {
  label: string;
  /** 오른쪽에 회색으로 보여 줄 현재 값. */
  value?: string;
  /** 값이 없을 때 값 자리에 파란 글자로 보여 줄 행동 문구. */
  emptyValue?: string;
  /** 없으면 누를 수 없는 정보 행이 된다. */
  onPress?: () => void;
  /** 누를 수 있어도 화살표를 숨긴다. 로그아웃처럼 다른 화면으로 가지 않는 행. */
  chevron?: boolean;
  accessibilityLabel?: string;
}

/**
 * 프로필 탭의 한 줄. 왼쪽 이름, 오른쪽 값, 맨 끝 화살표로 짠다.
 *
 * 취향·계정·도움이 모두 같은 줄을 써서, 어디를 눌러야 하는지 한 번 배우면 끝난다.
 */
export function ProfileMenuRow({
  label,
  value,
  emptyValue,
  onPress,
  chevron = true,
  accessibilityLabel,
}: ProfileMenuRowProps) {
  const content = (
    <>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : emptyValue ? (
        <Text style={[styles.rowValue, styles.rowAction]} numberOfLines={1}>
          {emptyValue}
        </Text>
      ) : (
        <View style={styles.rowSpacer} />
      )}
      {onPress && chevron ? (
        <ChevronRight
          size={normalize(18)}
          color={tokens.colors.textMuted}
          strokeWidth={2}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    paddingHorizontal: normalize(tokens.spacing.m),
    paddingTop: normalize(tokens.spacing.m),
    paddingBottom: normalize(tokens.spacing.xs),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textLabel,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(tokens.spacing.s),
    minHeight: normalize(52),
    paddingHorizontal: normalize(tokens.spacing.m),
    backgroundColor: tokens.colors.white,
  },
  rowLabel: {
    flexShrink: 0,
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  rowAction: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  rowSpacer: {
    flex: 1,
  },
});
