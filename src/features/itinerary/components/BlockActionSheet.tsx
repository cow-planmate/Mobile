import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SheetModal from '../../../components/modals/SheetModal';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export type BlockAction = {
  key: string;
  /** 눈에 보이는 글자 */
  label: string;
  /** 스크린 리더와 테스트가 찾는 이름 */
  accessibilityLabel: string;
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

const { colors, fontFamily, fontSize, tones } = tokens;

/**
 * 시간표 블록의 ⋯ 를 누르면 열리는 동작 목록.
 * 블록에 아이콘 넷을 늘어놓는 대신 필요할 때만 꺼낸다.
 *
 * 다른 아래 시트와 같은 껍데기(SheetModal)를 쓴다 — 손잡이와 제목 줄, 닫기가
 * 같은 자리에 있어야 시트마다 다르게 느껴지지 않는다. 줄에는 아이콘을 달지 않고
 * 글자만 두며, 지우기는 구분선 아래에 빨간 글자로 따로 둔다.
 */
export default function BlockActionSheet({
  visible,
  title,
  actions,
  onClose,
}: BlockActionSheetProps) {
  return (
    <SheetModal visible={visible} title={title} onClose={onClose}>
      <View style={styles.list}>
        {actions.map(action => (
          <React.Fragment key={action.key}>
            {action.destructive ? <View style={styles.divider} /> : null}
            <TouchableOpacity
              style={[styles.row, action.disabled && styles.rowDisabled]}
              onPress={action.disabled ? undefined : action.onPress}
              disabled={action.disabled}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityState={{ disabled: !!action.disabled }}
            >
              <Text
                style={[styles.label, action.destructive && styles.labelDanger]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
  },
  row: {
    minHeight: normalize(50),
    justifyContent: 'center',
  },
  rowDisabled: {
    opacity: 0.35,
  },
  divider: {
    height: 1,
    marginVertical: normalize(4),
    backgroundColor: colors.border,
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
