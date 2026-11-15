import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import Info from 'lucide-react-native/dist/esm/icons/info';
import XCircle from 'lucide-react-native/dist/esm/icons/circle-x';
import { sf, sp } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: sf(tokens.spacing.m),
    paddingVertical: sf(14),
    borderRadius: tokens.radius.xl,
    marginHorizontal: sf(tokens.spacing.l),
    marginTop: sf(tokens.spacing.s),
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    // 떠 있는 요소라 테두리 대신 그림자로 바탕과 떼어 놓는다.
    ...tokens.shadows.md,
  },
  textGroup: {
    marginLeft: sf(tokens.spacing.s + tokens.spacing.xs),
    flexShrink: 1,
  },
  // 제목은 굵기로, 설명은 옅은 색으로 위계를 만든다.
  text: {
    color: tokens.colors.text,
    fontSize: sp(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.semibold,
    letterSpacing: -0.2,
    textAlign: 'left',
    flexShrink: 1,
    lineHeight: sp(20),
    fontVariant: ['tabular-nums'],
  },
  subText: {
    marginTop: sf(2),
    color: tokens.colors.textMuted,
    fontSize: sp(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    textAlign: 'left',
    flexShrink: 1,
    lineHeight: sp(17),
    fontVariant: ['tabular-nums'],
  },
});

// text2를 넘기는 호출부가 있는데 렌더하지 않아 조용히 버려지던 것을 살린다.
const ToastBody = ({ text1, text2 }: { text1?: string; text2?: string }) => (
  <View style={toastStyles.textGroup}>
    <Text style={toastStyles.text}>{text1 ?? ''}</Text>
    {text2 ? <Text style={toastStyles.subText}>{text2}</Text> : null}
  </View>
);

/**
 * onPress를 넘겨도 눌리지 않던 것을 살린다.
 *
 * 토스트 라이브러리는 onPress를 그대로 넘겨줄 뿐이라, 여기서 감싸 주지 않으면
 * 손이 닿을 자리가 없다. 넘기지 않은 토스트는 지금까지처럼 그냥 알리기만 한다.
 */
const ToastShell = ({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: React.ReactNode;
}) => {
  // 라이브러리의 슬라이드(스프링, 튕김)는 props로 못 바꾸므로, 본체를 부드럽게 나타나게 해
  // 튕김이 도드라지지 않게 한다. 네이티브 드라이버라 JS 스레드가 바빠도 끊기지 않는다.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const enterStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  return (
    <Animated.View style={enterStyle}>
      {onPress ? (
        <TouchableOpacity
          style={toastStyles.container}
          onPress={onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {children}
        </TouchableOpacity>
      ) : (
        <View style={toastStyles.container}>{children}</View>
      )}
    </Animated.View>
  );
};

export const toastConfig: ToastConfig = {
  error: ({ text1, text2, onPress }) => (
    <ToastShell onPress={onPress}>
      <XCircle size={20} color={tokens.tones.danger.fg} strokeWidth={2.5} />
      <ToastBody text1={text1} text2={text2} />
    </ToastShell>
  ),
  success: ({ text1, text2, onPress }) => (
    <ToastShell onPress={onPress}>
      <CheckCircle2
        size={20}
        color={tokens.tones.success.fg}
        strokeWidth={2.5}
      />
      <ToastBody text1={text1} text2={text2} />
    </ToastShell>
  ),
  info: ({ text1, text2, onPress }) => (
    <ToastShell onPress={onPress}>
      <Info size={20} color={tokens.colors.primary} strokeWidth={2.5} />
      <ToastBody text1={text1} text2={text2} />
    </ToastShell>
  ),
};
