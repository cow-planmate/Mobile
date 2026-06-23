import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAlert } from '../../../contexts/AlertContext';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({
        title: '입력 오류',
        message: '모든 필드를 입력해 주세요.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: '일치하지 않음',
        message: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        title: '보안 취약',
        message: '새 비밀번호는 최소 6자 이상이어야 합니다.',
      });
      return;
    }

    showAlert({
      title: '비밀번호 변경 성공 🎉',
      message: '비밀번호가 안전하게 변경되었습니다.',
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.lockIconContainer}>
            <View style={styles.lockIconCircle}>
              <Lock size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>비밀번호를 재설정합니다</Text>
            <Text style={styles.subtitle}>
              안전한 계정 보안을 위해 주기적으로 비밀번호를 변경해주시는 것이 좋습니다.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>현재 비밀번호</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="현재 비밀번호를 입력해주세요"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>새 비밀번호</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="새 비밀번호를 입력해주세요 (6자 이상)"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>새 비밀번호 확인</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="새 비밀번호를 한 번 더 입력해주세요"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
            <Text style={styles.submitButtonText}>비밀번호 변경하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: normalize(4),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: normalize(24),
  },
  lockIconContainer: {
    alignItems: 'center',
    marginVertical: normalize(16),
  },
  lockIconCircle: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    backgroundColor: COLORS.sub,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  title: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  subtitle: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(18),
    paddingHorizontal: normalize(16),
  },
  form: {
    marginTop: normalize(16),
    gap: normalize(16),
    marginBottom: normalize(32),
  },
  inputWrapper: {
    gap: normalize(6),
  },
  label: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.textLabel,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: normalize(12),
    height: normalize(44),
  },
  input: {
    flex: 1,
    fontSize: normalize(14),
    color: COLORS.text,
    padding: 0,
  },
  eyeIcon: {
    padding: normalize(4),
  },
  submitButton: {
    height: normalize(48),
    backgroundColor: COLORS.primary,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
