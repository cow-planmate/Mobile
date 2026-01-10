import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { styles } from './UpdateThemeModal.styles';

type UpdateThemeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function UpdateThemeModal({
  visible,
  onClose,
  onConfirm,
}: UpdateThemeModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleSelectTheme = () => {
    Alert.alert('알림', '선호 테마 선택 기능은 준비 중입니다.');
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
          <Text style={styles.title}>선호 테마 변경</Text>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleSelectTheme}
            >
              <Text style={styles.selectButtonText}>선호테마 선택하기</Text>
            </TouchableOpacity>
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
