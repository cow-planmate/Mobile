import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

import { styles } from './PaxModal.styles';

type PaxModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pax: { adults: number; children: number }) => void;
  initialAdults: number;
  initialChildren: number;
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.sheetRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>인원 선택</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="선택 완료"
            >
              <Text style={styles.sheetDone}>완료</Text>
            </TouchableOpacity>
          </View>
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
        </View>
      </View>
    </Modal>
  );
}
