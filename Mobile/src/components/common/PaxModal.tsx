import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { X, Minus, Plus } from 'lucide-react-native';

import { styles, COLORS } from './PaxModal.styles';

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
      >
        <Minus
          size={16}
          color={count <= minValue ? COLORS.placeholder : COLORS.primary}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text style={styles.counterValue}>{count}</Text>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={onIncrease}
        activeOpacity={0.7}
      >
        <Plus size={16} color={COLORS.primary} strokeWidth={2} />
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

  const handleConfirm = () => {
    onConfirm({ adults, children });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>인원 선택</Text>
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color={COLORS.placeholder} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.counterSection}>
            <PaxCounter
              label="성인"
              count={adults}
              onIncrease={() => setAdults(adults + 1)}
              onDecrease={() => setAdults(Math.max(1, adults - 1))}
              minValue={1}
            />
            <View style={styles.divider} />
            <PaxCounter
              label="어린이"
              subtitle="만 17세 이하"
              count={children}
              onIncrease={() => setChildren(children + 1)}
              onDecrease={() => setChildren(Math.max(0, children - 1))}
              minValue={0}
            />
          </View>
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
