import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sf, sp } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

/**
 * 새 버전이 나와 업데이트 전에는 앱을 쓸 수 없을 때 앱 전체를 덮는 안내.
 *
 * 닫을 방법을 두지 않는다. 뒤로 가기도 막는다(onRequestClose를 비운다).
 */
export default function ForceUpdateModal({
  visible,
  onUpdate,
}: {
  visible: boolean;
  onUpdate: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.container}>
        <View style={styles.body}>
          <Text style={styles.title}>새 버전으로 업데이트해 주세요</Text>
          <Text style={styles.message}>
            더 안정적이고 새로워진 버전이 나왔어요. 업데이트한 뒤에 계속 쓸 수
            있어요.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={onUpdate}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="업데이트"
        >
          <Text style={styles.buttonText}>업데이트</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
    paddingHorizontal: sf(tokens.spacing.l),
    paddingBottom: sf(tokens.spacing.xl),
    justifyContent: 'center',
  },
  body: {
    gap: sf(tokens.spacing.s),
    marginBottom: sf(tokens.spacing.xl),
  },
  title: {
    fontSize: sp(tokens.fontSize.xl),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.4,
  },
  message: {
    fontSize: sp(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textMuted,
    lineHeight: sp(24),
  },
  button: {
    height: sf(52),
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: sp(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
