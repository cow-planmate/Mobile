import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import BottomSheet from './BottomSheet';
import { styles } from './PaxModal.styles';

type PaxModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pax: { adults: number; children: number }) => void;
  initialAdults: number;
  initialChildren: number;
  onDone?: () => void;
};

const PaxCounter = ({
  label,
  subtitle,
  count,
  onIncrease,
  onDecrease,
  minValue,
}: {
  label: string;
  subtitle?: string;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minValue: number;
}) => (
  <View style={styles.counterRow}>
    <View style={styles.counterLabelContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      {subtitle && <Text style={styles.counterSubLabel}>{subtitle}</Text>}
    </View>
    <View style={styles.counterControls}>
      <TouchableOpacity
        style={[
          styles.counterButton,
          count <= minValue && styles.counterButtonDisabled,
        ]}
        onPress={onDecrease}
        disabled={count <= minValue}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="button"
        accessibilityLabel={`${label} 줄이기`}
        accessibilityState={{ disabled: count <= minValue }}
      >
        <Text
          style={[
            styles.counterGlyph,
            count <= minValue && styles.counterGlyphDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>
      <Text style={styles.counterValue} accessibilityLabel={`${count}명`}>
        {count}
      </Text>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={onIncrease}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="button"
        accessibilityLabel={`${label} 늘리기`}
      >
        <Text style={styles.counterGlyph}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function PaxModal({
  visible,
  onClose,
  onConfirm,
  initialAdults,
  initialChildren,
  onDone,
}: PaxModalProps) {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  useEffect(() => {
    if (visible) {
      setAdults(initialAdults);
      setChildren(initialChildren);
    }
  }, [visible, initialAdults, initialChildren]);

  const applyPax = (nextAdults: number, nextChildren: number) => {
    setAdults(nextAdults);
    setChildren(nextChildren);
    onConfirm({ adults: nextAdults, children: nextChildren });
  };

  // 화면에 보이는 값을 그대로 확정하며 닫는다. 아무것도 건드리지 않고 닫아도
  // 기본값 성인 1명이 비어 있는 채로 남지 않는다.
  const handleClose = () => {
    onConfirm({ adults, children });
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title="인원 선택"
      onClose={handleClose}
      onDone={onDone}
    >
      <View style={styles.counterSection}>
        <PaxCounter
          label="성인"
          subtitle="만 18세 이상"
          count={adults}
          onIncrease={() => applyPax(adults + 1, children)}
          onDecrease={() => applyPax(Math.max(1, adults - 1), children)}
          minValue={1}
        />
        <View style={styles.divider} />
        <PaxCounter
          label="어린이"
          subtitle="만 17세 이하"
          count={children}
          onIncrease={() => applyPax(adults, children + 1)}
          onDecrease={() => applyPax(adults, Math.max(0, children - 1))}
          minValue={0}
        />
      </View>
    </BottomSheet>
  );
}
