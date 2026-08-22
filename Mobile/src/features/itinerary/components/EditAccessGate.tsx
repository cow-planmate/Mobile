import React, { useCallback, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LockKeyhole from 'lucide-react-native/dist/esm/icons/lock-keyhole';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { requestEditAccess } from '../../../api/trips';
import { parseBackendError } from '../../../utils/errorHandler';

export type EditAccessRequestStatus = 'idle' | 'sending' | 'sent' | 'failed';

const ALREADY_MEMBER_CODE = 'COLLAB_002';
const DUPLICATE_PENDING_CODE = 'COLLAB_003';

export interface EditAccessGateProps {
  visible: boolean;
  planId: string | null;
  onGoBack: () => void;

  /** 서버가 "이미 멤버"라고 답할 때 — 화면이 들고 있던 목록이 낡았다는 신호. */
  onStaleMembership?: () => void;
}

export default function EditAccessGate({
  visible,
  planId,
  onGoBack,
  onStaleMembership,
}: EditAccessGateProps) {
  const [status, setStatus] = useState<EditAccessRequestStatus>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const handleRequest = useCallback(async () => {
    if (!planId || status === 'sending' || status === 'sent') return;

    setStatus('sending');
    setNotice(null);

    try {
      await requestEditAccess(planId);
      setStatus('sent');
      setNotice('요청을 보냈어요. 소유자가 수락하면 편집할 수 있습니다.');
    } catch (error) {
      const { code, message } = parseBackendError(error);

      // 이미 멤버인데 막혔다면 들고 있던 목록이 낡은 것이다 — 갱신하면 이 화면이 걷힌다.
      if (code === ALREADY_MEMBER_CODE) {
        setStatus('idle');
        setNotice(null);
        onStaleMembership?.();
        return;
      }

      if (code === DUPLICATE_PENDING_CODE) {
        setStatus('sent');
        setNotice('이미 보낸 요청이 처리를 기다리고 있어요.');
        return;
      }

      setStatus('failed');
      setNotice(message);
    }
  }, [planId, status, onStaleMembership]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onGoBack}
    >
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <LockKeyhole
            size={normalize(28)}
            color={tokens.colors.primary}
            strokeWidth={1.5}
          />
        </View>

        <Text style={styles.title}>편집 권한이 없어요</Text>
        <Text style={styles.description}>
          소유자에게 권한을 요청하면 수락된 뒤부터 함께 편집할 수 있습니다.
        </Text>

        {notice ? (
          <Text
            style={[styles.notice, status === 'failed' && styles.noticeError]}
          >
            {notice}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (status === 'sending' || status === 'sent') &&
                styles.buttonDisabled,
            ]}
            onPress={handleRequest}
            disabled={status === 'sending' || status === 'sent' || !planId}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {status === 'sending'
                ? '요청하는 중…'
                : status === 'sent'
                ? '요청 완료'
                : '편집 권한 요청하기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onGoBack}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(tokens.spacing.s),
    paddingHorizontal: normalize(tokens.spacing.l),
    backgroundColor: tokens.colors.background,
  },
  iconCircle: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: tokens.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primaryTint,
    marginBottom: normalize(tokens.spacing.xs),
  },
  title: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  notice: {
    marginTop: normalize(tokens.spacing.xs),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primary,
    textAlign: 'center',
  },
  noticeError: {
    color: tokens.tones.danger.fg,
  },
  actions: {
    alignSelf: 'stretch',
    gap: normalize(tokens.spacing.s),
    marginTop: normalize(tokens.spacing.l),
  },
  primaryButton: {
    paddingVertical: normalize(14),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: tokens.colors.textTertiary,
  },
  primaryButtonText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  secondaryButton: {
    paddingVertical: normalize(14),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
});
