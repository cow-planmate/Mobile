import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SheetModal from '../../../components/modals/SheetModal';
import FallbackImage from '../../../components/common/FallbackImage';
import { toSecureImageUrl } from '../../../utils/imageUrl';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export type BlockAction = {
  key: string;
  /** 눈에 보이는 글자 */
  label: string;
  /** 스크린 리더와 테스트가 찾는 이름 */
  accessibilityLabel: string;
  /** 항목 아래 회색 한 줄. 눌렀을 때 무엇이 되는지 알린다. */
  description?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type BlockActionSheetProps = {
  visible: boolean;
  title: string;
  /** 제목 아래 줄. 갈래와 시간 같은 장소 요약. */
  subtitle?: string;
  /** 제목 앞의 장소 사진. */
  imageUri?: string | null;
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
  subtitle,
  imageUri,
  actions,
  onClose,
}: BlockActionSheetProps) {
  return (
    <SheetModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      leading={
        imageUri !== undefined ? (
          <FallbackImage
            uri={toSecureImageUrl(imageUri ?? '')}
            style={styles.photo}
            fallback={<View style={[styles.photo, styles.photoEmpty]} />}
          />
        ) : undefined
      }
      onClose={onClose}
    >
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
              {action.description ? (
                <Text style={styles.description}>{action.description}</Text>
              ) : null}
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
  photo: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(10),
  },
  photoEmpty: {
    backgroundColor: colors.borderLight,
  },
  row: {
    minHeight: normalize(50),
    paddingVertical: normalize(8),
    justifyContent: 'center',
  },
  description: {
    marginTop: normalize(2),
    fontFamily: fontFamily.regular,
    fontSize: normalize(13),
    color: colors.textMuted,
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
