import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { styles, COLORS } from './UpdatePasswordModal.styles';
import { useAlert } from '../../contexts/AlertContext';

type UpdatePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (current: string, newPass: string) => void;
};

const PasswordInput = ({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? (
            <EyeOff size={20} color={COLORS.placeholder} strokeWidth={1.5} />
          ) : (
            <Eye size={20} color={COLORS.placeholder} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function UpdatePasswordModal({
  visible,
  onClose,
  onConfirm,
}: UpdatePasswordModalProps) {
  const { showAlert } = useAlert();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleConfirm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({ title: '오류', message: '모든 필드를 입력해주세요.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ title: '오류', message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    onConfirm(currentPassword, newPassword);
    handleClose();
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          <Text style={styles.title}>비밀번호 변경</Text>

          <PasswordInput
            label="현재 비밀번호"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="현재 비밀번호를 입력하세요"
          />
          <PasswordInput
            label="새 비밀번호"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="새 비밀번호를 입력하세요"
          />
          <PasswordInput
            label="비밀번호 재입력"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="비밀번호를 다시 입력하세요"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
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
