import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';

import { styles } from './PaxModal.styles';

type PaxModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pax: { adults: number; children: number }) => void;
  initialAdults: number;
  initialChildren: number;
};

const PaxCounter = ({ label, count, onIncrease, onDecrease }: any) => (
  <View style={styles.counterRow}>
    <Text style={styles.counterLabel}>{label}</Text>
    <View style={styles.counterControls}>
      <TouchableOpacity style={styles.counterButton} onPress={onDecrease}>
        <Text style={styles.counterButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.counterValue}>{count}</Text>
      <TouchableOpacity style={styles.counterButton} onPress={onIncrease}>
        <Text style={styles.counterButtonText}>+</Text>
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
          <PaxCounter
            label="성인"
            count={adults}
            onIncrease={() => setAdults(adults + 1)}
            onDecrease={() => setAdults(Math.max(1, adults - 1))}
          />
          <PaxCounter
            label="어린이 (만 17세 이하)"
            count={children}
            onIncrease={() => setChildren(children + 1)}
            onDecrease={() => setChildren(Math.max(0, children - 1))}
          />
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
