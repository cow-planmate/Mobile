import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { tokens } from '../../../theme/tokens';

export type BlockAction = {
  key: string;
  /** 눈에 보이는 글자 */
  label: string;
  /** 스크린 리더와 테스트가 찾는 이름 */
  accessibilityLabel: string;
  icon: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type BlockActionSheetProps = {
  visible: boolean;
  title: string;
  actions: BlockAction[];
  onClose: () => void;
};

const { colors, fontFamily, fontSize, radius, spacing, tones } = tokens;

/**
 * 시간표 블록의 ⋯ 를 누르면 열리는 동작 목록.
 * 블록에 아이콘 넷을 늘어놓는 대신 필요할 때만 꺼낸다.
 */
export default function BlockActionSheet({
  visible,
  title,
  actions,
  onClose,
}: BlockActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        {/* 목록 안을 눌렀을 때 바탕의 닫기까지 번지지 않게 한다. */}
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {actions.map(action => (
            <TouchableOpacity
              key={action.key}
              style={[styles.row, action.disabled && styles.rowDisabled]}
              onPress={action.disabled ? undefined : action.onPress}
              disabled={action.disabled}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityState={{ disabled: !!action.disabled }}
            >
              {action.icon}
              <Text
                style={[styles.label, action.destructive && styles.labelDanger]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(26, 26, 26, 0.32)',
  },
  sheet: {
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.s,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.white,
  },
  title: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.m,
    color: colors.text,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    minHeight: 52,
    paddingHorizontal: spacing.m,
    borderRadius: radius.l,
  },
  rowDisabled: {
    opacity: 0.35,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.m,
    color: colors.text,
  },
  labelDanger: {
    color: tones.danger.fg,
  },
});
