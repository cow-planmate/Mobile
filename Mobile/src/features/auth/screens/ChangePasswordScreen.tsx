import React, { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  ChangePasswordScreenView,
  ChangePasswordErrors,
  ChangePasswordForm,
} from './ChangePasswordScreen.view';
import { changePassword } from '../../../api/auth';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import { getPasswordRequirements } from '../../../utils/passwordPolicy';

/**
 * 비밀번호 변경 컨테이너.
 *
 * 규칙은 회원가입과 같다. 서버도 8자 이상을 요구하므로(@Size(min=8)) 여기서
 * 먼저 걸러 왕복을 아낀다.
 */
export default function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = useCallback(
    (field: keyof ChangePasswordForm, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      setErrors(prev => {
        if (!prev[field] && !prev.form) return prev;
        const next = { ...prev };
        delete next[field];
        delete next.form;
        return next;
      });
    },
    [],
  );

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(form.newPassword),
    [form.newPassword],
  );

  const isPasswordMatch = useMemo(
    () =>
      form.confirmPassword.length > 0 &&
      form.newPassword === form.confirmPassword,
    [form.newPassword, form.confirmPassword],
  );

  const isSubmitEnabled =
    form.currentPassword.length > 0 &&
    passwordRequirements.hasMinLength &&
    passwordRequirements.hasCombination &&
    isPasswordMatch;

  /** 막지 않고, 눌렀을 때 무엇이 모자란지 칸마다 붙인다. */
  const validate = useCallback((): ChangePasswordErrors => {
    const next: ChangePasswordErrors = {};

    if (!form.currentPassword) {
      next.currentPassword = '현재 비밀번호를 입력해 주세요.';
    }

    if (!passwordRequirements.hasMinLength || !passwordRequirements.hasCombination) {
      next.newPassword = '비밀번호 조건을 모두 채워 주세요.';
    } else if (form.newPassword === form.currentPassword) {
      next.newPassword = '지금 쓰는 비밀번호와 다르게 정해 주세요.';
    }

    if (!isPasswordMatch) {
      next.confirmPassword = '비밀번호가 일치하지 않아요.';
    }

    return next;
  }, [form, passwordRequirements, isPasswordMatch]);

  const handleSubmit = useCallback(async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await changePassword(
        form.currentPassword,
        form.newPassword,
        form.confirmPassword,
      );
      // 화면을 벗어난 뒤에도 결과가 남도록 토스트로 알린다.
      Toast.show({
        type: 'success',
        text1: '비밀번호를 변경했어요.',
        position: 'top',
        visibilityTime: 2500,
      });
      navigation.goBack();
    } catch (e) {
      setErrors({
        form: getDisplayErrorMessage(e, '비밀번호를 변경하지 못했어요.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, form, navigation]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <ChangePasswordScreenView
      form={form}
      errors={errors}
      passwordRequirements={passwordRequirements}
      isPasswordMatch={isPasswordMatch}
      isSubmitting={isSubmitting}
      isSubmitEnabled={isSubmitEnabled}
      focusedField={focusedField}
      isCurrentVisible={isCurrentVisible}
      isNewVisible={isNewVisible}
      isConfirmVisible={isConfirmVisible}
      onChange={onChange}
      onSubmit={handleSubmit}
      onBack={handleBack}
      setFocusedField={setFocusedField}
      setIsCurrentVisible={setIsCurrentVisible}
      setIsNewVisible={setIsNewVisible}
      setIsConfirmVisible={setIsConfirmVisible}
    />
  );
}
