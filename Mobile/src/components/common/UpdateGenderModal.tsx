import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { styles } from './UpdateGenderModal.styles';

type UpdateGenderModalProps = {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function UpdateGenderModal({
  visible,
  initialValue,
  onClose,
  onConfirm,
}: UpdateGenderModalProps) {
  const [gender, setGender] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setGender(initialValue);
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    onConfirm(gender);
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
          <Text style={styles.title}>성별 변경</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>성별 선택</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === '남자' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('남자')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === '남자' && styles.genderButtonTextSelected,
                  ]}
                >
                  남자
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === '여자' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('여자')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === '여자' && styles.genderButtonTextSelected,
                  ]}
                >
                  여자
                </Text>
              </TouchableOpacity>
            </View>
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
