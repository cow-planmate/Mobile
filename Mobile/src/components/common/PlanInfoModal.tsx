import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={2}>
      {value}
    </Text>
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
        <Row label="이름" value={planName} />
        <Row label="여행지" value={destination} />
        <Row label="기간" value={period} />
        <Row label="인원" value={pax} />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
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
