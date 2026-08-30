import React, { useEffect, useState } from 'react';
import {
  Dimensions,
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

const ENTER_MS = 280;
const EXIT_MS = 220;

/**
 * 여행지·기간·인원이 공유하는 시트 껍데기.
 *
 * 배경은 페이드로, 시트는 아래에서 밀어 올린다. 다만 reanimated의 레이아웃
 * 애니메이션(SlideInDown 등)은 쓰지 않는다. Modal 안에서 쓰면 애니메이션이
 * 끝난 뒤에도 시트가 상태바 높이만큼(이 기기에서는 95px) 위에 뜬 채로 남아
 * 아래로 탭바가 비쳤다. transform은 레이아웃을 건드리지 않아 그 문제가 없고,
 * 닫힐 때 언마운트를 직접 늦출 수 있어 퇴장 애니메이션도 실제로 보인다.
 */
export default function BottomSheet({
  visible,
  title,
  onClose,
  onDone,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);

  const progress = useSharedValue(0);
  // 높이를 재기 전에는 화면 높이로 두어 첫 프레임이 화면 밖에서 시작하도록 한다.
  const sheetHeight = useSharedValue(Dimensions.get('window').height);

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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value }],
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

        <Animated.View
          onLayout={event => {
            sheetHeight.value = event.nativeEvent.layout.height;
          }}
          // 제스처 바 높이만큼 더 깔아야 내용이 그 아래로 들어가지 않는다.
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: normalize(10) + insets.bottom },
          ]}
        >
          <View style={styles.grabber} />
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 15, 20, 0.28)',
  },
  sheet: {
    backgroundColor: tokens.colors.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    maxHeight: '82%',
  },
  grabber: {
    width: normalize(36),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: tokens.colors.border,
    alignSelf: 'center',
    marginTop: normalize(9),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(10),
    paddingBottom: normalize(8),
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
