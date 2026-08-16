import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import X from 'lucide-react-native/dist/esm/icons/x';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

type PrivacyVariant = 'policy' | 'consent';

interface PrivacySection {
  title: string;
  bullets: string[];
}

const COMMON_SECTIONS: PrivacySection[] = [
  {
    title: '1. 수집·이용 목적',
    bullets: [
      '회원 관리 및 서비스 제공',
      '문의 대응 및 공지사항 전달',
      '맞춤형 서비스 제공 및 이벤트 안내',
    ],
  },
  {
    title: '2. 수집하는 개인정보 항목',
    bullets: ['필수 항목: 이메일, 비밀번호, 닉네임, 생년월일, 성별'],
  },
  {
    title: '3. 개인정보 보유·이용 기간',
    bullets: [
      '회원 탈퇴 시 지체 없이 파기',
      '단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관',
    ],
  },
  {
    title: '4. 동의 거부 권리 및 불이익 안내',
    bullets: [
      '회원가입 시 필수 항목 동의를 거부할 경우 회원가입이 불가합니다.',
    ],
  },
];

const POLICY_SECTIONS: PrivacySection[] = [
  ...COMMON_SECTIONS.slice(0, 1),
  {
    ...COMMON_SECTIONS[1],
    bullets: [
      ...COMMON_SECTIONS[1].bullets,
      'SNS 계정 로그인 시: 이메일 주소, 프로필 정보(닉네임, 프로필 이미지 등) 및 서비스 제공에 필요한 최소한의 계정 식별자',
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
    title: '개인정보 수집·이용 동의',
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessible={false}
          importantForAccessibility="no"
        />
        <View style={styles.modal}>
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

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {content.sections.map(section => (
              <View key={section.title}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.bullets.map(bullet => (
                  <Text key={bullet} style={styles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{content.closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sf(16),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
  },
  modal: {
    width: '100%',
    height: '80%',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.lg,
    padding: sf(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sf(16),
  },
  title: {
    fontSize: sp(TYPO.headline.fontSize),
    lineHeight: sp(TYPO.headline.lineHeight),
    letterSpacing: TYPO.headline.letterSpacing,
    fontFamily: TYPO.headline.fontFamily,
    color: COLORS.text,
  },
  closeIcon: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sf(-10),
  },
  scroll: {
    flex: 1,
    marginBottom: sf(16),
  },
  scrollContent: {
    paddingBottom: sf(12),
  },
  sectionTitle: {
    fontSize: sp(TYPO.label.fontSize),
    lineHeight: sp(TYPO.label.lineHeight),
    letterSpacing: TYPO.label.letterSpacing,
    fontFamily: TYPO.label.fontFamily,
    color: COLORS.text,
    marginTop: sf(12),
    marginBottom: sf(6),
  },
  bullet: {
    fontSize: sp(TYPO.caption.fontSize),
    lineHeight: sp(TYPO.caption.lineHeight),
    letterSpacing: TYPO.caption.letterSpacing,
    fontFamily: TYPO.caption.fontFamily,
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
