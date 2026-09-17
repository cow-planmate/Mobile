import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import X from 'lucide-react-native/dist/esm/icons/x';
import { normalize } from '../../../../utils/normalize';
import { COLORS, styles } from './ChecklistSheet.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  overlay?: React.ReactNode;
  containerRef?: React.Ref<View>;
}

export default function ChecklistPopup({
  visible,
  onClose,
  footer,
  children,
  overlay,
  containerRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(0, { duration: 160 }, finished => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessible={false}
            importantForAccessibility="no"
          />
        </Animated.View>
        {/*
          키보드를 피해 카드를 밀어 올리지 않는다. 카드는 제자리에 그대로 두고
          아래쪽이 키보드에 가려지게 둔다. 담기는 입력칸의 완료 키로 끝낸다.
        */}
        <View style={styles.popupLayer} pointerEvents="box-none">
          <View
            pointerEvents="box-none"
            style={[
              styles.popupRoot,
              {
                paddingTop: insets.top + normalize(16),
                paddingBottom: insets.bottom + normalize(16),
              },
            ]}
          >
            <Animated.View ref={containerRef} style={[styles.popup, cardStyle]}>
              <View style={styles.header}>
                <View style={styles.heading}>
                  <Text style={styles.eyebrow}>TRAVEL CHECKLIST</Text>
                  <Text style={styles.title} accessibilityRole="header">
                    여행 준비물
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="여행 준비물 닫기"
                  activeOpacity={0.7}
                >
                  <X
                    size={normalize(20)}
                    color={COLORS.textSecondary}
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>
              </View>
              {children}
              <View style={styles.footer}>{footer}</View>
              {overlay}
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
