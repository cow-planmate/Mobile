import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { styles } from './UpdateGenderModal.styles';
import X from 'lucide-react-native/dist/esm/icons/x';
import { tokens } from '../../theme/tokens';

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
          <View style={styles.header}>
            <Text style={styles.title}>성별 변경</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
            >
              <X size={20} color={tokens.colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

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

          <View style={styles.confirmFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
