import React, { useCallback, useMemo, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import {
  OAuthAdditionalInfoScreenView,
  OAuthAdditionalInfoErrors,
  OAuthAdditionalInfoForm,
} from './OAuthAdditionalInfoScreen.view';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthStackParamList } from '../../../navigation/types';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import { toBirthdateString } from '../../../utils/birthdate';
import { useSubmitLock } from '../../../hooks/useSubmitLock';

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

const GENDER_ENUM: Record<string, string> = { male: 'MALE', female: 'FEMALE' };

type OAuthAdditionalInfoScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OAuthAdditionalInfo'
>;

type OAuthAdditionalInfoScreenProps = {
  route: OAuthAdditionalInfoScreenRouteProp;
  navigation: { goBack: () => void };
};

export default function OAuthAdditionalInfoScreen({
  route,
  navigation,
}: OAuthAdditionalInfoScreenProps) {
  const { signupId, needEmail, provider } = route.params;
  const oauthComplete = useAuthStore(state => state.oauthComplete);

  const [form, setForm] = useState<OAuthAdditionalInfoForm>({
    email: '',
    birthdate: '',
    gender: '',
  });
  const [errors, setErrors] = useState<OAuthAdditionalInfoErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);
  const { isSubmitting, runExclusive: runCompleteExclusive } = useSubmitLock();

  const onChange = useCallback(
    (field: keyof OAuthAdditionalInfoForm, value: string) => {
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

  const isCompleteEnabled = useMemo(
    () =>
      (!needEmail || form.email.trim().length > 0) &&
      !!form.birthdate &&
      !!form.gender,
    [needEmail, form.email, form.birthdate, form.gender],
  );

  const validate = useCallback((): OAuthAdditionalInfoErrors => {
    const next: OAuthAdditionalInfoErrors = {};

    if (needEmail) {
      const email = form.email.trim();
      if (!email) {
        next.email = '이메일을 입력해 주세요.';
      } else if (!EMAIL_REGEX.test(email)) {
        next.email = '이메일 형식이 올바르지 않아요.';
      }
    }

    if (!form.birthdate) {
      next.birthdate = '생년월일을 선택해 주세요.';
    } else if (form.birthdate >= toBirthdateString(new Date())) {

      next.birthdate = '생년월일을 다시 확인해 주세요.';
    }

    if (!GENDER_ENUM[form.gender]) {
      next.gender = '성별을 선택해 주세요.';
    }

    return next;
  }, [needEmail, form.email, form.birthdate, form.gender]);

  const handleComplete = useCallback(async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await runCompleteExclusive(async () => {
      try {
        await oauthComplete(
          {
            signupId,
            email: needEmail ? form.email.trim() : null,
            birthdate: form.birthdate,
            gender: GENDER_ENUM[form.gender],
          },
          provider,
        );
      } catch (e) {
        setErrors({
          form: getDisplayErrorMessage(e, '가입 처리 중 문제가 생겼어요.'),
        });
      }
    });
  }, [
    validate,
    oauthComplete,
    signupId,
    needEmail,
    form,
    provider,
    runCompleteExclusive,
  ]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <OAuthAdditionalInfoScreenView
      needEmail={needEmail}
      form={form}
      errors={errors}
      isSubmitting={isSubmitting}
      isCompleteEnabled={isCompleteEnabled}
      focusedField={focusedField}
      isBirthdatePickerOpen={isBirthdatePickerOpen}
      onChange={onChange}
      onComplete={handleComplete}
      onBack={handleBack}
      setFocusedField={setFocusedField}
      setBirthdatePickerOpen={setBirthdatePickerOpen}
    />
  );
}
