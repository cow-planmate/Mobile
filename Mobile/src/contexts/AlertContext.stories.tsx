import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Button, StyleSheet, Text, ScrollView } from 'react-native';
import { AlertProvider, useAlert } from './AlertContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';
import { XCircle, CheckCircle2, Info } from 'lucide-react-native';

/* ── Toast Styles (Same as App.tsx) ── */
const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: 'rgba(28, 28, 30, 0.90)', // Glassmorphism dark base
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Subtle border
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'left',
    marginLeft: 8,
    flexShrink: 1,
    lineHeight: 18,
  },
  successText: {
    color: '#FFFFFF',
  },
  infoText: {
    color: '#FFFFFF',
  },
});

/* ── Toast Config (Same as App.tsx) ── */
const toastConfig: ToastConfig = {
  error: ({ text1 }) => (
    <View style={toastStyles.container}>
      <XCircle size={18} color="#FF453A" strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  success: ({ text1 }) => (
    <View style={toastStyles.container}>
      <CheckCircle2 size={18} color="#30D158" strokeWidth={2.5} />
      <Text style={[toastStyles.text, toastStyles.successText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Info size={18} color="#0A84FF" strokeWidth={2.5} />
      <Text style={[toastStyles.text, toastStyles.infoText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
};

const AlertTestHelper = () => {
  const { showAlert } = useAlert();

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#F9FAFB', gap: 16 }}>
      {/* ── 1. 로그인 / 회원가입 (Auth) ── */}
      <Text style={s.sectionTitle}>1. 로그인 및 회원가입 피드백</Text>
      <View style={s.buttonGrid}>
        <Button
          title="토스트: 이메일 미입력"
          color="#E11D48"
          onPress={() =>
            Toast.show({
              type: 'error',
              text1: '이메일을 입력해주세요.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="토스트: 닉네임 중복"
          color="#E11D48"
          onPress={() =>
            Toast.show({
              type: 'error',
              text1: '이미 사용 중인 닉네임입니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="토스트: 닉네임 사용가능"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '사용 가능한 닉네임입니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="모달: 회원가입 완료"
          color="#1344FF"
          onPress={() =>
            showAlert({
              title: '환영합니다!',
              message: '회원가입이 완료되었습니다. 로그인 해주세요.',
              type: 'success',
            })
          }
        />
      </View>

      <View style={s.divider} />

      {/* ── 2. 비밀번호 분실 및 재설정 ── */}
      <Text style={s.sectionTitle}>2. 비밀번호 재설정 피드백</Text>
      <View style={s.buttonGrid}>
        <Button
          title="토스트: 이메일 인증 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '이메일 인증이 완료되었습니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="토스트: 인증번호 불일치"
          color="#E11D48"
          onPress={() =>
            Toast.show({
              type: 'error',
              text1: '인증번호가 올바르지 않습니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="모달: 인증 시간 초과"
          color="#FF9500"
          onPress={() =>
            showAlert({
              title: '시간 초과',
              message: '인증 시간이 만료되었습니다. 인증번호를 다시 받을 수 있습니다.',
              type: 'warning',
            })
          }
        />
        <Button
          title="모달: 임시 비밀번호 전송"
          color="#1344FF"
          onPress={() =>
            showAlert({
              title: '발송 완료',
              message: '이메일로 임시 비밀번호가 발송되었습니다.\n\n로그인 후 내 일정에서 비밀번호를 변경해주세요.',
              type: 'success',
            })
          }
        />
      </View>

      <View style={s.divider} />

      {/* ── 3. 사용자 프로필 수정 ── */}
      <Text style={s.sectionTitle}>3. 프로필 수정 피드백</Text>
      <View style={s.buttonGrid}>
        <Button
          title="토스트: 닉네임 변경 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '닉네임이 변경되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 나이 변경 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '나이가 변경되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 성별 변경 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '성별이 변경되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 테마 변경 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '선호 테마가 변경되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 현재 비번 불일치"
          color="#E11D48"
          onPress={() =>
            Toast.show({
              type: 'error',
              text1: '현재 비밀번호가 일치하지 않습니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
        <Button
          title="토스트: 비번 변경 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '비밀번호가 성공적으로 변경되었습니다.',
              position: 'top',
              visibilityTime: 2500,
            })
          }
        />
      </View>

      <View style={s.divider} />

      {/* ── 4. 일정 편집 (Undo/Redo 및 카드 수정/추가/삭제) ── */}
      <Text style={s.sectionTitle}>4. 일정 편집 피드백</Text>
      <View style={s.buttonGrid}>
        <Button
          title="토스트: 일정 시간 수정 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '일정 시간이 수정되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 일정 삭제 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '일정이 삭제되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 일정 추가 완료"
          color="#34C759"
          onPress={() =>
            Toast.show({
              type: 'success',
              text1: '일정이 추가되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 실행취소 불가 (Undo)"
          color="#BFBFBF"
          onPress={() =>
            Toast.show({
              type: 'info',
              text1: '되돌릴 일정이 없습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
        <Button
          title="토스트: 다시실행 불가 (Redo)"
          color="#BFBFBF"
          onPress={() =>
            Toast.show({
              type: 'info',
              text1: '다시 실행할 일정이 없습니다.',
              position: 'top',
              visibilityTime: 2000,
            })
          }
        />
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
});

const meta = {
  title: 'Contexts/AlertContext',
  component: AlertTestHelper,
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <Story />
          <Toast config={toastConfig} />
        </AlertProvider>
      </GestureHandlerRootView>
    ),
  ],
} satisfies Meta<typeof AlertTestHelper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
