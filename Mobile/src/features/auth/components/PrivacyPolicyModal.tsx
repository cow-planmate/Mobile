import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
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
import X from 'lucide-react-native/dist/esm/icons/x';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

const ENTER_MS = 280;
const EXIT_MS = 220;

type PrivacyVariant = 'policy' | 'consent';

interface PrivacySection {
  title: string;
  bullets: string[];
}

const COMMON_SECTIONS: PrivacySection[] = [
  {
    title: '1. 수집 및 이용 목적',
    bullets: [
      '회원가입 시 본인 식별과 중복 가입 및 계정 도용 방지를 위해 이용합니다.',
      '친구와의 실시간 여행 일정 공동 편집, 여행 피드 및 커뮤니티 서비스를 제공하기 위해 이용합니다.',
      '고객 문의 응대와 서비스 품질 개선 및 안전한 이용 환경을 구축하기 위해 활용합니다.',
    ],
  },
  {
    title: '2. 수집하는 개인정보 항목',
    bullets: [
      '회원가입 시 이메일 주소, 비밀번호, 닉네임, 생년월일, 성별을 필수로 수집합니다.',
      '서비스 이용 과정에서 기기 정보(OS 버전, 기기 모델명) 및 접속 로그가 자동으로 생성되어 수집될 수 있습니다.',
    ],
  },
  {
    title: '3. 개인정보 보유 및 이용 기간',
    bullets: [
      '회원 탈퇴 시 수집된 개인정보는 지체 없이 안전하게 파기하는 것을 원칙으로 합니다.',
      '단, 관계 법령에 따라 접속 기록(통신비밀보호법)은 3개월, 소비자 불만 및 분쟁 처리 기록(전자상거래법)은 3년간 보관 후 파기합니다.',
    ],
  },
  {
    title: '4. 동의 거부 권리 및 불이익 안내',
    bullets: [
      '이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.',
      '단, 안내된 항목은 서비스 제공을 위한 최소한의 필수 정보이므로, 동의하지 않으실 경우 회원가입이 불가합니다.',
    ],
  },
];

const POLICY_SECTIONS: PrivacySection[] = [
  ...COMMON_SECTIONS.slice(0, 1),
  {
    ...COMMON_SECTIONS[1],
    bullets: [
      ...COMMON_SECTIONS[1].bullets,
      'SNS 계정 로그인 시: 이메일 주소, 프로필 정보(닉네임, 프로필 이미지 등) 및 서비스 제공에 필요한 최소한의 계정 식별자를 수집합니다.',
    ],
  },
  ...COMMON_SECTIONS.slice(2, 3),
  {
    ...COMMON_SECTIONS[3],
    bullets: [
      ...COMMON_SECTIONS[3].bullets,
      '선택 항목은 동의하지 않아도 회원가입은 가능하며, 일부 서비스 이용이 제한될 수 있습니다.',
    ],
  },
  {
    title: '5. SNS 계정 로그인 관련 안내',
    bullets: [
      '구글 등 외부 SNS 제공자는 OAuth 인증을 통해 로그인 기능만 제공하며, 회원님의 비밀번호를 당사에 제공하지 않습니다.',
      '당사는 SNS 제공자로부터 제공받은 최소한의 정보(이메일, 프로필 정보 등)를 회원 식별 및 서비스 제공 목적에 한정하여 이용합니다.',
      'SNS 계정 연동 해제 또는 회원 탈퇴 시, 관련 정보는 법령에 따른 보존 의무가 없는 한 지체 없이 파기됩니다.',
    ],
  },
];

const CONTENT: Record<
  PrivacyVariant,
  { title: string; closeLabel: string; sections: PrivacySection[] }
> = {
  policy: {
    title: '개인정보 처리방침',
    closeLabel: '확인',
    sections: POLICY_SECTIONS,
  },
  consent: {
    title: '개인정보 수집 및 이용 동의',
    closeLabel: '닫기',
    sections: COMMON_SECTIONS,
  },
};

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  variant: PrivacyVariant;
}

export default function PrivacyPolicyModal({
  visible,
  onClose,
  variant,
}: PrivacyPolicyModalProps) {
  const content = CONTENT[variant];
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

  // 레이아웃 애니메이션은 Modal 안에서 종료 후에도 시트를 상태바 높이만큼
  // 위에 남겨 아래가 비친다. transform은 레이아웃을 건드리지 않아 안전하다.
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
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

        <Animated.View
          onLayout={event => {
            sheetHeight.value = event.nativeEvent.layout.height;
          }}
          style={[styles.modal, sheetStyle]}
        >
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>{content.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeIcon}
              accessibilityRole="button"
              accessibilityLabel={`${content.title} 닫기`}
            >
              <X size={sf(20)} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.scrollBox}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
              persistentScrollbar
            >
              {content.sections.map(section => (
                <View key={section.title} style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.bullets.map(bullet => (
                    <Text key={bullet} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{content.closeLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
  },
  modal: {
    width: '100%',
    height: '85%',
    backgroundColor: COLORS.surfaceRaised,
    borderTopLeftRadius: sf(24),
    borderTopRightRadius: sf(24),
    paddingHorizontal: sf(20),
    paddingTop: sf(12),
    paddingBottom: sf(24),
  },
  handleBar: {
    width: sf(36),
    height: sf(4),
    borderRadius: sf(2),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: sf(14),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sf(12),
  },
  title: {
    fontSize: sp(TYPO.headline.fontSize),
    lineHeight: sp(TYPO.headline.lineHeight),
    letterSpacing: TYPO.headline.letterSpacing,
    fontFamily: TYPO.headline.fontFamily,
    color: COLORS.text,
  },
  closeIcon: {
    width: sf(44),
    height: sf(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sf(-8),
  },
  scrollBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: sf(14),
    paddingTop: sf(12),
    marginBottom: sf(16),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: sf(14),
  },
  sectionBlock: {
    marginBottom: sf(16),
  },
  sectionTitle: {
    fontSize: sp(TYPO.label.fontSize),
    lineHeight: sp(TYPO.label.lineHeight),
    letterSpacing: TYPO.label.letterSpacing,
    fontFamily: TYPO.label.fontFamily,
    color: COLORS.text,
    marginBottom: sf(6),
  },
  bullet: {
    fontSize: sp(13.5),
    lineHeight: sp(21),
    letterSpacing: TYPO.caption.letterSpacing,
    fontFamily: TYPO.body.fontFamily,
    color: COLORS.textSecondary,
    marginBottom: sf(4),
    paddingLeft: sf(4),
  },
  closeButton: {
    height: sf(52),
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: sp(TYPO.button.fontSize),
    lineHeight: sp(TYPO.button.lineHeight),
    letterSpacing: TYPO.button.letterSpacing,
    fontFamily: TYPO.button.fontFamily,
    color: COLORS.onPrimary,
  },
});
