import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';
import { formatPeriod } from '../../utils/timeUtils';

type PlanInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  planName: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  adultCount: number;
  childCount: number;
  onEditName?: () => void;
  onEditPeriod?: () => void;
};

const Row = ({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={2}>
      {value}
    </Text>
    {onEdit && (
      <TouchableOpacity
        onPress={onEdit}
        style={styles.editButton}
        accessibilityRole="button"
        accessibilityLabel={`${label} 편집`}
      >
        <Text style={styles.editText}>편집</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function PlanInfoModal({
  visible,
  onClose,
  planName,
  destination,
  startDate,
  endDate,
  adultCount,
  childCount,
  onEditName,
  onEditPeriod,
}: PlanInfoModalProps) {
  const period = formatPeriod(startDate, endDate) || '미지정';
  const pax =
    `성인 ${adultCount}명` + (childCount > 0 ? `, 어린이 ${childCount}명` : '');

  return (
    <PopupModal
      visible={visible}
      title="일정 정보"
      onClose={onClose}
      doneLabel="확인"
    >
      <View style={styles.list}>
        <Row label="이름" value={planName} onEdit={onEditName} />
        <Row label="여행지" value={destination} />
        <Row label="기간" value={period} onEdit={onEditPeriod} />
        <Row label="인원" value={pax} />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  editButton: {
    minHeight: normalize(44),
    minWidth: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -normalize(10),
    marginLeft: normalize(8),
  },
  editText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  list: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  // 이름표를 왼쪽에 고정 폭으로 두면 값이 한 줄로 가지런히 선다.
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: normalize(11),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  label: {
    width: normalize(64),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  value: {
    flex: 1,
    fontSize: normalize(13.5),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
});
