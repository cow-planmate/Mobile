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

import ArrowRight from 'lucide-react-native/dist/esm/icons/arrow-right';
import X from 'lucide-react-native/dist/esm/icons/x';

import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  /** 배경 탭·뒤로가기·완료 어느 쪽으로 닫히든 불린다. */
  onClose: () => void;
  /** 완료를 눌렀을 때만 불린다. 다음 단계로 넘기는 자리다. */
  onDone?: () => void;
  /**
   * 버튼이 하는 일.
   *
   * 'next'는 다음 팝업을 여는 자리라 "다음 →", 'last'는 여기서 끝나므로 "완료"다.
   * 같은 말이 서로 다른 일을 하지 않도록 문구를 나눈다.
   */
  doneAction?: 'next' | 'last';
  /** 기본 단추 문구를 바꾸고 싶을 때만. */
  doneLabel?: string;
  /**
   * 밑줄을 통째로 갈아끼운다.
   *
   * 고르기만 하는 팝업은 단추 하나면 되지만, 지우기와 저장처럼 둘을
   * 나란히 놓아야 하는 곳도 있다. 그런 곳은 이 자리를 직접 채운다.
   */
  footer?: React.ReactNode;
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
  doneAction = 'last',
  doneLabel,
  footer,
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

  const isNext = doneAction === 'next';

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
            testID="popup-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessible={false}
            importantForAccessibility="no"
          />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X
                size={normalize(18)}
                color={tokens.colors.textTertiary}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>{children}</View>

          <View style={styles.footer}>
            {footer !== undefined ? (
              footer
            ) : (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={isNext ? '다음 단계로' : '선택 완료'}
              >
                <Text style={styles.doneButtonText}>
                  {doneLabel ?? (isNext ? '다음' : '완료')}
                </Text>
                {isNext ? (
                  <ArrowRight
                    size={normalize(15)}
                    color={tokens.colors.white}
                    strokeWidth={2.2}
                  />
                ) : null}
              </TouchableOpacity>
            )}
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(15),
    paddingBottom: normalize(10),
  },
  // 내용이 길면 여기가 줄어들면서 안쪽 스크롤을 내준다.
  // 밑줄과 머릿줄은 줄어들지 않아 항상 보인다.
  body: {
    flexShrink: 1,
  },
  // 고른 뒤 눈과 손이 머무는 아래쪽에 둔다. 헤더 구석의 글자보다 겨냥하기 쉽다.
  footer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    marginTop: normalize(8),
  },
  doneButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
  },
  doneButtonText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  title: {
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
});
