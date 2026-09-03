import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import Info from 'lucide-react-native/dist/esm/icons/info';
import XCircle from 'lucide-react-native/dist/esm/icons/circle-x';
import type { LucideIcon } from 'lucide-react-native';

type AlertType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert(): AlertContextType {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within <AlertProvider>');
  }
  return ctx;
}

const ICON_MAP: Record<AlertType, { Icon: LucideIcon; color: string }> = {
  success: { Icon: CheckCircle2, color: '#34C759' },
  error: { Icon: XCircle, color: '#FF3B30' },
  info: { Icon: Info, color: '#1344FF' },
  warning: { Icon: AlertCircle, color: '#FF9500' },
  confirm: { Icon: AlertCircle, color: '#1344FF' },
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const queueRef = useRef<AlertOptions[]>([]);
  const pendingCallbackRef = useRef<(() => void) | undefined>(undefined);

  const visibleRef = useRef(false);

  const backdrop = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  const showAlertInternal = useCallback((opts: AlertOptions) => {
    visibleRef.current = true;
    setOptions(opts);
    setVisible(true);
  }, []);

  const onAnimateOutDone = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
    setOptions(null);
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = undefined;
    cb?.();

    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setTimeout(() => showAlertInternal(next), 120);
    }
  }, [showAlertInternal]);

  const animateIn = useCallback(() => {
    backdrop.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [backdrop, scale, opacity]);

  const animateOut = useCallback(
    (cb?: () => void) => {
      pendingCallbackRef.current = cb;
      backdrop.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      scale.value = withTiming(0.92, {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(
        0,
        { duration: 160, easing: Easing.in(Easing.cubic) },
        finished => {
          if (finished) {
            runOnJS(onAnimateOutDone)();
          }
        },
      );
    },
    [backdrop, scale, opacity, onAnimateOutDone],
  );

  useEffect(() => {
    if (visible && options) {

      backdrop.value = 0;
      scale.value = 0.92;
      opacity.value = 0;

      const t = setTimeout(animateIn, 50);
      return () => clearTimeout(t);
    }
  }, [visible, options, animateIn, backdrop, scale, opacity]);

  const showAlert = useCallback(
    (opts: AlertOptions) => {
      if (visibleRef.current) {
        queueRef.current.push(opts);
        return;
      }
      showAlertInternal(opts);
    },
    [showAlertInternal],
  );

  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  const handlePress = useCallback(
    (button?: AlertButton) => {
      animateOut(() => button?.onPress?.());
    },
    [animateOut],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.45,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const buttons: AlertButton[] =
    options?.buttons && options.buttons.length > 0
      ? options.buttons
      : [{ text: '확인', style: 'default' }];

  // 지우기 단추가 달린 물음은 아직 아무 일도 잘못되지 않았으므로 오류(빨강)가
  // 아니라 주의(주황)다. 제목의 낱말이 아니라 실제로 달린 단추로 판별한다.
  const hasDestructive = buttons.some(b => b.style === 'destructive');
  const alertType = hasDestructive
    ? 'warning'
    : options?.type ?? inferType(options?.title);
  const { Icon, color } = ICON_MAP[alertType];

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() =>
          handlePress(buttons.find(b => b.style === 'cancel') ?? buttons[0])
        }
      >
        <View style={s.overlay}>
          <Animated.View style={[s.backdrop, backdropStyle]} />
          <Animated.View style={[s.card, cardStyle]}>

            {/* 표식은 글 칸 바깥 여백에 매단다. 감싸지 않으므로 제목이 길어져도
                제목과 본문이 하나의 왼쪽 선을 유지한다. */}
            <View style={s.head}>
              <View style={s.gutter}>
                <Icon size={18} color={color} strokeWidth={1.9} />
              </View>
              <View style={s.headText}>
                <Text style={s.title}>{options?.title}</Text>
                {options?.message ? (
                  <Text style={s.message}>{options.message}</Text>
                ) : null}
              </View>
            </View>

            <View style={s.buttonRow}>
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                // 되돌릴 수 없는 쪽이 더 쉬워 보이면 안 된다. 지우기가 달린
                // 물음에서는 물러나는 쪽이 채운 단추를 갖고, 지우기는 빨간
                // 실선으로만 둘러 약하게 둔다. 지우기가 없는 곳에서는 평소대로
                // 밀고 나가는 쪽이 채운 단추다.
                const isFilled = hasDestructive ? isCancel : !isCancel;

                return (
                  <Pressable
                    key={i}
                    testID={`alert-button-${i}`}
                    style={({ pressed }) => [
                      s.button,
                      isFilled && s.buttonFilled,
                      isDestructive && s.buttonDestructive,
                      !isFilled && !isDestructive && s.buttonQuiet,
                      !isDestructive && { flex: 1 },
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      style={[
                        s.buttonText,
                        isFilled && s.buttonTextFilled,
                        isDestructive && s.buttonTextDestructive,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

function inferType(title?: string): AlertType {
  if (!title) return 'info';
  if (/성공|완료|사용 가능|수락|발송/.test(title)) return 'success';
  if (/오류|실패|사용 불가/.test(title)) return 'error';
  if (/삭제|탈퇴|거절/.test(title)) return 'confirm';
  return 'info';
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - 48, 336);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingTop: 22,
    paddingBottom: 18,
    paddingLeft: 18,
    paddingRight: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  head: {
    flexDirection: 'row',
  },
  gutter: {
    width: 20,
    paddingTop: 3,
  },
  headText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  message: {
    marginTop: 7,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    width: '100%',
  },
  button: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonFilled: {
    backgroundColor: '#1344FF',
  },
  buttonQuiet: {
    borderColor: '#E5E7EB',
  },
  // 채우지 않고 테두리만 둘러 취소보다 약하되, 어디까지가 단추인지는 분명하게.
  buttonDestructive: {
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
  },
  buttonTextFilled: {
    color: '#FFFFFF',
  },
  buttonTextDestructive: {
    color: '#FF3B30',
  },
});
