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

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;

/** 화면 선택값 → 서버 Gender enum. 서버에는 OTHER도 있으나 화면은 둘만 받는다. */
const GENDER_ENUM: Record<string, string> = { male: 'MALE', female: 'FEMALE' };

type OAuthAdditionalInfoScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OAuthAdditionalInfo'
>;

type OAuthAdditionalInfoScreenProps = {
  route: OAuthAdditionalInfoScreenRouteProp;
  navigation: { goBack: () => void };
};

/**
 * 소셜 로그인 후 서버가 요구하는 추가 정보(이메일·생년월일·성별) 입력 컨테이너.
 */
export default function OAuthAdditionalInfoScreen({
  route,
  navigation,
}: OAuthAdditionalInfoScreenProps) {
  const { signupId, needEmail } = route.params;
  const oauthComplete = useAuthStore(state => state.oauthComplete);

  const [form, setForm] = useState<OAuthAdditionalInfoForm>({
    email: '',
    birthdate: '',
    gender: '',
  });
  const [errors, setErrors] = useState<OAuthAdditionalInfoErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /** 채우지 않은 칸을 눌러도 알 수 있도록, 막지 않고 눌렀을 때 이유를 붙인다. */
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
      // 서버 birthdate는 @Past다. 오늘 이후 날짜는 여기서 걸러 낸다.
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
    setIsSubmitting(true);
    try {
      await oauthComplete({
        signupId,
        email: needEmail ? form.email.trim() : null,
        birthdate: form.birthdate,
        gender: GENDER_ENUM[form.gender],
      });
      // 성공하면 스토어가 user를 채우고 루트 네비게이터가 화면을 바꾼다.
    } catch (e) {
      setErrors({
        form: getDisplayErrorMessage(e, '가입 처리 중 문제가 생겼어요.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, oauthComplete, signupId, needEmail, form]);

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
