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
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  LucideIcon,
} from 'lucide-react-native';

// ── Types ──

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

// ── Context ──

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert(): AlertContextType {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within <AlertProvider>');
  }
  return ctx;
}

// ── Icon mapping ──

const ICON_MAP: Record<AlertType, { Icon: LucideIcon; color: string }> = {
  success: { Icon: CheckCircle2, color: '#34C759' },
  error: { Icon: XCircle, color: '#FF3B30' },
  info: { Icon: Info, color: '#1344FF' },
  warning: { Icon: AlertCircle, color: '#FF9500' },
  confirm: { Icon: AlertCircle, color: '#1344FF' },
};

// ── Provider ──

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const queueRef = useRef<AlertOptions[]>([]);
  const pendingCallbackRef = useRef<(() => void) | undefined>(undefined);
  /**
   * showAlert의 참조를 고정하기 위한 표시 여부 미러.
   *
   * showAlert가 visible state에 의존하면 알림이 열리고 닫힐 때마다 컨텍스트
   * 값이 새로 만들어져 useAlert를 쓰는 모든 화면(26곳)이 재렌더된다.
   * 같은 틱에 showAlert가 두 번 호출될 때 state는 아직 갱신되지 않아
   * 두 번째 알림이 큐에 들어가지 않고 첫 알림을 덮어쓰는 문제도 함께 해결된다.
   */
  const visibleRef = useRef(false);

  // Animation values
  const backdrop = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  const showAlertInternal = useCallback((opts: AlertOptions) => {
    visibleRef.current = true;
    setOptions(opts);
    setVisible(true);
  }, []);

  // Stable JS callback invoked via runOnJS after animate-out finishes
  const onAnimateOutDone = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
    setOptions(null);
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = undefined;
    cb?.();
    // Process queue
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
      // Reset to initial values before animating in
      backdrop.value = 0;
      scale.value = 0.92;
      opacity.value = 0;
      // Small delay to let Modal mount
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

  // showAlert 참조가 고정되므로 컨텍스트 값도 마운트 이후 변하지 않는다.
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

  // Determine buttons
  const buttons: AlertButton[] =
    options?.buttons && options.buttons.length > 0
      ? options.buttons
      : [{ text: '확인', style: 'default' }];

  const alertType = options?.type ?? inferType(options?.title);
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
            {/* Icon */}
            <View style={[s.iconWrap, { backgroundColor: color + '14' }]}>
              <Icon size={28} color={color} strokeWidth={2} />
            </View>

            {/* Title */}
            <Text style={s.title}>{options?.title}</Text>

            {/* Message */}
            {options?.message ? (
              <Text style={s.message}>{options.message}</Text>
            ) : null}

            {/* Buttons */}
            <View
              style={[s.buttonRow, buttons.length === 1 && s.buttonRowSingle]}
            >
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const isPrimary =
                  !isDestructive &&
                  !isCancel &&
                  (buttons.length === 1 || i === buttons.length - 1);

                return (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [
                      s.button,
                      isPrimary && s.buttonPrimary,
                      isDestructive && s.buttonDestructive,
                      isCancel && s.buttonCancel,
                      buttons.length > 1 && { flex: 1 },
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      style={[
                        s.buttonText,
                        isPrimary && s.buttonTextPrimary,
                        isDestructive && s.buttonTextDestructive,
                        isCancel && s.buttonTextCancel,
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

// ── Helpers ──

function inferType(title?: string): AlertType {
  if (!title) return 'info';
  if (/성공|완료|사용 가능|수락|발송/.test(title)) return 'success';
  if (/오류|실패|사용 불가/.test(title)) return 'error';
  if (/삭제|탈퇴|거절/.test(title)) return 'confirm';
  return 'info';
}

// ── Styles ──

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - 56, 320);

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
    borderRadius: 20, // More rounded, modern corners
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6', // Delicate border to define edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06, // Smoother floating shadow
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    width: '100%',
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  button: {
    height: 46, // Taller buttons for better tap target
    borderRadius: 12, // Modern rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: '#1344FF',
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonCancel: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#4B5563', // Slightly darker cancel text color
  },
});
