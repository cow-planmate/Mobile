import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { AlertProvider, useAlert } from './AlertContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';
import { XCircle } from 'lucide-react-native';

/* ── Toast Styles (Same as App.tsx) ── */
const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 36,
    marginTop: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
    flexShrink: 1,
    lineHeight: 20,
  },
  successText: {
    marginLeft: 0,
    color: '#30D158',
  },
  infoText: {
    marginLeft: 0,
    color: '#BFBFBF',
  },
});

/* ── Toast Config (Same as App.tsx) ── */
const toastConfig: ToastConfig = {
  error: ({ text1 }) => (
    <View style={toastStyles.container}>
      <XCircle size={20} color="#FF453A" strokeWidth={2.5} />
      <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    </View>
  ),
  success: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Text style={[toastStyles.text, toastStyles.successText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={toastStyles.container}>
      <Text style={[toastStyles.text, toastStyles.infoText]}>
        {text1 ?? ''}
      </Text>
    </View>
  ),
};

const AlertTestHelper = () => {
  const { showAlert } = useAlert();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        backgroundColor: '#F9FAFB',
      }}
    >
      {/* ── Toast Notifications (위에서 아래로 내려오는 상단 토스트) ── */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 10 }}>
        상단 슬라이드 토스트 (로그인 입력 오류 예시)
      </Text>
      <Button
        title="토스트: 입력 누락 오류"
        color="#E11D48"
        onPress={() =>
          Toast.show({
            type: 'error',
            text1: '입력되지 않은 항목이 있어요.',
            position: 'top',
            visibilityTime: 2500,
          })
        }
      />
      <Button
        title="토스트: 이메일 형식 오류"
        color="#E11D48"
        onPress={() =>
          Toast.show({
            type: 'error',
            text1: '이메일 형식이 올바르지 않아요.',
            position: 'top',
            visibilityTime: 2500,
          })
        }
      />
      <Button
        title="토스트: 비밀번호 자릿수 오류"
        color="#E11D48"
        onPress={() =>
          Toast.show({
            type: 'error',
            text1: '비밀번호는 최소 4자리 이상이어야 해요.',
            position: 'top',
            visibilityTime: 2500,
          })
        }
      />
      <Button
        title="토스트: 로그인 정보 불일치"
        color="#E11D48"
        onPress={() =>
          Toast.show({
            type: 'error',
            text1: '가입된 정보가 없거나 비밀번호가 맞지 않아요.',
            position: 'top',
            visibilityTime: 2500,
          })
        }
      />

      <View style={{ width: '100%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 }} />

      {/* ── Modal Dialogs ── */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
        중앙 팝업 모달 알림
      </Text>
      <Button
        title="모달: 로그인 성공 (Success)"
        color="#34C759"
        onPress={() =>
          showAlert({
            title: '로그인 성공',
            message: '환영합니다! 플랜메이트에 성공적으로 로그인했습니다.',
            type: 'success',
          })
        }
      />
      <Button
        title="모달: 로그인 실패 (Error)"
        color="#FF3B30"
        onPress={() =>
          showAlert({
            title: '로그인 실패',
            message: '아이디 또는 비밀번호가 일치하지 않습니다. 다시 입력해주세요.',
            type: 'error',
          })
        }
      />
      <Button
        title="모달: 서버 오류 (Warning)"
        color="#FF9500"
        onPress={() =>
          showAlert({
            title: '서버 오류',
            message: '네트워크 연결 상태가 불안정하여 정보를 불러오지 못했습니다.',
            type: 'warning',
          })
        }
      />
      <Button
        title="모달: 회원탈퇴 확인 (Confirm)"
        color="#1344FF"
        onPress={() =>
          showAlert({
            title: '정말 탈퇴하시겠습니까?',
            message: '탈퇴 시 작성하신 모든 일정 정보와 계정 데이터가 영구 삭제됩니다.',
            type: 'confirm',
            buttons: [
              { text: '취소', style: 'cancel' },
              {
                text: '탈퇴하기',
                style: 'destructive',
                onPress: () => console.log('Account deleted'),
              },
            ],
          })
        }
      />
    </View>
  );
};

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
