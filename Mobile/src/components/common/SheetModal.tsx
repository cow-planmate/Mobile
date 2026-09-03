import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  /** 배경 탭·뒤로가기·닫기 어느 쪽으로 닫히든 불린다. */
  onClose: () => void;
  /**
   * 머릿줄 오른쪽, 닫기 왼쪽 자리.
   *
   * 새로고침처럼 창 전체에 걸리는 일만 둔다. 목록 안의 일은 목록 줄에 둔다.
   */
  headerAction?: React.ReactNode;
  /** 시트가 화면에서 차지할 최대 높이. 0과 1 사이. */
  maxHeightRatio?: number;
  /** 글을 적는 자리가 있는 시트는 켠다 — 자판이 올라와도 시트가 가려지지 않는다. */
  avoidKeyboard?: boolean;
  /** 밑줄에 고정으로 둘 것. 없으면 밑줄 자체를 그리지 않는다. */
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const ENTER_MS = 280;
const EXIT_MS = 220;

/**
 * 아래에서 올라오는 창이 공유하는 껍데기.
 *
 * 가운데 카드인 PopupModal과 머릿줄·밑줄 규격을 맞춘다. 다른 점은 나타나는
 * 방향뿐이다 — 목록이 길거나 화면 아래쪽을 짚어가며 보는 내용은 여기를 쓴다.
 *
 * reanimated의 레이아웃 애니메이션(SlideInDown 등)은 쓰지 않는다. Modal 안에서
 * 쓰면 끝난 뒤에도 시트가 상태바 높이만큼 위에 뜬 채 남아 아래로 탭바가 비친다.
 * transform은 레이아웃을 건드리지 않아 그 문제가 없고, 닫힐 때 언마운트를 늦출
 * 수 있어 퇴장 동작도 실제로 보인다.
 */
export default function SheetModal({
  visible,
  title,
  onClose,
  headerAction,
  maxHeightRatio = 0.85,
  avoidKeyboard = false,
  footer,
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

  const Root = avoidKeyboard ? KeyboardAvoidingView : View;
  const rootProps = avoidKeyboard
    ? { behavior: Platform.OS === 'ios' ? ('padding' as const) : ('height' as const) }
    : {};

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Root style={styles.root} accessibilityViewIsModal {...rootProps}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            testID="sheet-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessible={false}
            importantForAccessibility="no"
          />
        </Animated.View>

        <Animated.View
          onLayout={event => {
            sheetHeight.value = event.nativeEvent.layout.height;
          }}
          style={[
            styles.sheet,
            sheetStyle,
            {
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
              // 제스처 바 높이만큼 더 깔아야 내용이 그 아래로 들어가지 않는다.
              paddingBottom: normalize(10) + insets.bottom,
            },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerRight}>
              {headerAction}
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
          </View>

          <View style={styles.body}>{children}</View>

          {footer === undefined ? null : (
            <View style={styles.footer}>{footer}</View>
          )}
        </Animated.View>
      </Root>
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
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(10),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  title: {
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  // 내용이 길면 여기가 줄어들면서 안쪽 스크롤을 내준다.
  // 밑줄과 머릿줄은 줄어들지 않아 항상 보인다.
  body: {
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    marginTop: normalize(8),
  },
});
