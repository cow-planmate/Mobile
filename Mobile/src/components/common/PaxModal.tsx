// src/components/common/PaxModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#007AFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
};

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
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <PaxCounter
            label="성인"
            count={adults}
            onIncrease={() => setAdults(adults + 1)}
            onDecrease={() => setAdults(Math.max(1, adults - 1))} // 성인은 최소 1명
          />
          <PaxCounter
            label="어린이 (만 17세 이하)"
            count={children}
            onIncrease={() => setChildren(children + 1)}
            onDecrease={() => setChildren(Math.max(0, children - 1))} // 어린이는 최소 0명
          />
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  counterLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
