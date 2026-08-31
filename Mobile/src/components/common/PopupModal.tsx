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

import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  /** 배경 탭·뒤로가기·완료 어느 쪽으로 닫히든 불린다. */
  onClose: () => void;
  /** 완료를 눌렀을 때만 불린다. 다음 단계로 넘기는 자리다. */
  onDone?: () => void;
  children: React.ReactNode;
};

const ENTER_MS = 200;
const EXIT_MS = 160;

/**
 * 여행지·기간·인원이 공유하는 팝업 껍데기.
 *
 * 배경은 페이드로, 카드는 가운데에서 살짝 커지며 나타난다. reanimated의 레이아웃
 * 애니메이션(FadeIn 등)은 쓰지 않는다 — Modal 안에서 쓰면 애니메이션이 끝난 뒤에도
 * 뷰가 상태바 높이만큼 어긋난 자리에 남는다. transform은 레이아웃을 건드리지 않아
 * 그 문제가 없고, 닫힐 때 언마운트를 늦출 수 있어 퇴장 동작도 실제로 보인다.
 */
export default function PopupModal({
  visible,
  title,
  onClose,
  onDone,
  children,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    progress.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.in(Easing.cubic) },
      finished => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    // 0.96에서 1로. 더 크게 잡으면 튀어나오는 느낌이라 절제한다.
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  const handleDone = () => {
    onDone?.();
    onClose();
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleDone}
              hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="선택 완료"
            >
              <Text style={styles.done}>완료</Text>
            </TouchableOpacity>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 15, 20, 0.28)',
  },
  card: {
    width: '100%',
    maxWidth: normalize(420),
    // 내용이 길면 안쪽 스크롤이 받아준다. 화면을 넘기지 않는 선에서 멈춘다.
    maxHeight: '80%',
    flexShrink: 1,
    backgroundColor: tokens.colors.white,
    borderRadius: normalize(18),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingBottom: normalize(12),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(10),
  },
  title: {
    fontSize: normalize(14.5),
    fontFamily: 'Pretendard-Bold',
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  done: {
    fontSize: normalize(13),
    fontFamily: 'Pretendard-SemiBold',
    color: tokens.colors.primary,
  },
});
