import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { useAlert } from '../../contexts/AlertContext';
import { tokens } from '../../theme/tokens';
import {
  PASSWORD_MAX_LENGTH,
  getPasswordRequirements,
} from '../../utils/passwordPolicy';
import { useSubmitLock } from '../../hooks/useSubmitLock';

type UpdatePasswordModalProps = {
  visible: boolean;
  onClose: () => void;

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
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, isFocused && styles.inputBoxOn]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.textTertiary}
          secureTextEntry={!isPasswordVisible}
          maxLength={PASSWORD_MAX_LENGTH}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            isPasswordVisible ? '비밀번호 가리기' : '비밀번호 보기'
          }
        >
          {isPasswordVisible ? (
            <EyeOff
              size={normalize(18)}
              color={tokens.colors.textTertiary}
              strokeWidth={1.5}
            />
          ) : (
            <Eye
              size={normalize(18)}
              color={tokens.colors.textTertiary}
              strokeWidth={1.5}
            />
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
  const { isSubmitting, runExclusive } = useSubmitLock();

  const handleConfirm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({ title: '오류', message: '모든 필드를 입력해주세요.' });
      return;
    }

    const { hasMinLength, hasCombination } =
      getPasswordRequirements(newPassword);
    if (!hasMinLength || !hasCombination) {
      showAlert({
        title: '오류',
        message: '새 비밀번호는 8자 이상이고 영문·숫자·특수문자를 포함해야 해요.',
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
      showAlert({ title: '오류', message: '새 비밀번호가 일치하지 않아요.' });
      return;
    }

    return runExclusive(async () => {
      try {
        await onConfirm(currentPassword, newPassword);
        handleClose();
      } catch (_error) {
        return;
      }
    });
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <PopupModal
      visible={visible}
      title="비밀번호 변경"
      onClose={handleClose}
      footer={
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={isSubmitting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="비밀번호 변경"
          accessibilityState={{ disabled: isSubmitting }}
        >
          <Text style={styles.confirmText}>
            {isSubmitting ? '변경 중…' : '확인'}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.body}>
        <PasswordInput
          label="현재 비밀번호"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="지금 쓰는 비밀번호"
        />
        <PasswordInput
          label="새 비밀번호"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="8자 이상, 영문·숫자·특수문자"
        />
        <PasswordInput
          label="새 비밀번호 다시"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="한 번 더 입력"
        />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
    gap: normalize(14),
  },
  field: {
    gap: normalize(6),
  },
  label: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  // 테두리 색만 바꿔 초점을 알린다. 두께까지 바꾸면 칸이 들씩거린다.
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    height: normalize(46),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
  },
  inputBoxOn: {
    borderColor: tokens.colors.primary,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
  confirmButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
