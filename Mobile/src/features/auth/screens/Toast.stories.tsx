import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../../components/common/toastConfig';

type ToastKind = 'success' | 'error' | 'info';

interface ToastCase {
  label: string;
  type: ToastKind;
  text1: string;
}

const toastCases: ToastCase[] = [
  { label: '성공', type: 'success', text1: '저장되었습니다.' },
  { label: '오류', type: 'error', text1: '요청을 처리하지 못했습니다.' },
  { label: '안내', type: 'info', text1: '새로운 알림이 없습니다.' },
  { label: '인트로', type: 'info', text1: '한 번 더 누르면 종료됩니다' },
  { label: '상세', type: 'info', text1: '공유 링크를 복사했습니다.' },
];

function ToastPreview() {
  const showToast = (item: ToastCase) => {
    Toast.show({
      type: item.type,
      text1: item.text1,
      position: 'top',
      visibilityTime: 2200,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toast</Text>
      <View style={styles.buttonGrid}>
        {toastCases.map(item => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={() => showToast(item)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => Toast.hide()}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>닫기</Text>
      </Pressable>
      <Toast config={toastConfig} />
    </View>
  );
}

const meta = {
  title: 'Toast',
  component: ToastPreview,
} satisfies Meta<typeof ToastPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    marginTop: 24,
    marginBottom: 20,
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minWidth: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
