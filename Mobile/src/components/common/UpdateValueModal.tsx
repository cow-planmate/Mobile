import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { styles } from './UpdateValueModal.styles';

type UpdateValueModalProps = {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function UpdateValueModal({
  visible,
  title,
  label,
  initialValue,
  keyboardType = 'default',
  onClose,
  onConfirm,
}: UpdateValueModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType={keyboardType}
              autoFocus={true}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
