import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
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

/**
 * 여행지·기간·인원이 공유하는 시트 껍데기.
 *
 * 배경과 시트를 각각 애니메이션해야 해서 Modal의 animationType은 none으로 두고
 * reanimated가 배경은 페이드로, 시트는 아래에서 밀어 올린다. 회원가입의
 * 약관 시트와 같은 방식이다.
 */
export default function BottomSheet({
  visible,
  title,
  onClose,
  onDone,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleDone = () => {
    onDone?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(180)}
          style={styles.backdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(220)}
          // 시스템 내비게이션 바 높이만큼 더 깔아야 시트 아래로 탭바가 비치지 않는다.
          style={[styles.sheet, { paddingBottom: normalize(10) + insets.bottom }]}
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
