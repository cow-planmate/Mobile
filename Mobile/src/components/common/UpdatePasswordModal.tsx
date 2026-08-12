import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import X from 'lucide-react-native/dist/esm/icons/x';
import { styles, COLORS } from './UpdatePasswordModal.styles';
import { useAlert } from '../../contexts/AlertContext';
import {
  PASSWORD_MAX_LENGTH,
  getPasswordRequirements,
} from '../../utils/passwordPolicy';

type UpdatePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  /** 실패하면 예외를 던져야 한다. 그래야 입력을 지우지 않고 모달을 열어 둔다. */
  onConfirm: (current: string, newPass: string) => void | Promise<void>;
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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <View style={[styles.passwordContainer, isFocused && styles.inputFocused]}>
        <View style={styles.passwordContent}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!isPasswordVisible}
            maxLength={PASSWORD_MAX_LENGTH}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({ title: '오류', message: '모든 필드를 입력해주세요.' });
      return;
    }
    // 가입 화면과 같은 기준으로 먼저 거른다. 서버는 길이만 보므로 조합 규칙까지
    // 여기서 확인해야 화면마다 통과 기준이 달라지지 않는다.
    const { hasMinLength, hasCombination } =
      getPasswordRequirements(newPassword);
    if (!hasMinLength || !hasCombination) {
      showAlert({
        title: '오류',
        message: '새 비밀번호는 8자 이상이며 영문·숫자·특수문자를 포함해야 합니다.',
      });
      return;
    }
    if (newPassword === currentPassword) {
      showAlert({
        title: '오류',
        message: '지금 쓰는 비밀번호와 다르게 정해주세요.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ title: '오류', message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 성공했을 때만 닫는다. 실패하면 입력이 남아 있어야 다시 시도할 수 있다.
      await onConfirm(currentPassword, newPassword);
      handleClose();
    } catch (_error) {
      // 실패 사유는 호출부가 토스트로 알린다.
    } finally {
      setIsSubmitting(false);
    }
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
          <View style={styles.header}>
            <Text style={styles.title}>비밀번호 변경</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={20} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

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

          <View style={styles.confirmFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {isSubmitting ? '변경 중…' : '확인'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
