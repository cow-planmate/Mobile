// src/components/common/UpdateGenderModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
};

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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
