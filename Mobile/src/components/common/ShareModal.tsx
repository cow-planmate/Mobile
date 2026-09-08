import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Share,
  NativeModules,
  Switch,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Link2 from 'lucide-react-native/dist/esm/icons/link-2';
import Lock from 'lucide-react-native/dist/esm/icons/lock';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import {
  getShareUrl,
  buildShareUrl,
  updateShareStatus,
  inviteEditor,
  getEditors,
  removeEditor,
} from '../../api/trips';
import PopupModal from './PopupModal';
import { useAlert } from '../../contexts/AlertContext';
import { getNicknameLengthError } from '../../utils/nickname';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';
import {
  getDisplayErrorMessage,
  parseBackendError,
} from '../../utils/errorHandler';
import { useSubmitLock } from '../../hooks/useSubmitLock';

const ALREADY_MEMBER_CODE = 'COLLAB_002';

const DUPLICATE_PENDING_CODE = 'COLLAB_003';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  planId: string;
  isMock?: boolean;
  isOwner?: boolean;
}

export default function ShareModal({
  visible,
  onClose,
  planId,
  isMock = false,

  isOwner = false,
}: ShareModalProps) {
  const { showAlert } = useAlert();
  const shareLink = isMock
    ? 'https://planmate.cow/share/mock-trip-123'
    : planId
    ? buildShareUrl(planId)
    : '';
  const [nickname, setNickname] = useState('');
  const [isShared, setIsShared] = useState(true);
  const [editors, setEditors] = useState<any[]>([]);
  const shareStatusLock = useSubmitLock();
  const inviteLock = useSubmitLock();
  const currentPlanIdRef = useRef(planId);
  currentPlanIdRef.current = planId;

  const fetchShareLink = useCallback(
    async (signal?: AbortSignal) => {
      if (isMock) {
        setIsShared(true);
        return;
      }
      try {
        const response = await getShareUrl(planId, signal);
        if (signal?.aborted) return;
        if (typeof response.isShared === 'boolean') {
          setIsShared(response.isShared);
        }
      } catch (error) {
        if (signal?.aborted) return;
        console.error('Failed to fetch share link:', error);
      }
    },
    [isMock, planId],
  );

  const handleToggleShare = (newValue: boolean) =>
    shareStatusLock.runExclusive(async () => {
      const targetPlanId = planId;
      const previousValue = isShared;
      setIsShared(newValue);
      if (isMock) return;
      try {
        await updateShareStatus(targetPlanId, newValue);
        if (currentPlanIdRef.current !== targetPlanId) return;
        Toast.show({
          type: 'success',
          text1: newValue ? '일정 공유를 켰습니다.' : '일정 공유를 껐습니다.',
          position: 'top',
          visibilityTime: 1500,
        });
      } catch (error) {
        if (currentPlanIdRef.current !== targetPlanId) return;
        console.error('Failed to update share status:', error);
        setIsShared(previousValue);
        showAlert({ title: '오류', message: '공유 상태 변경에 실패했습니다.' });
      }
    });

  const handleCopyLink = () => {
    if (!shareLink) return;

    const hasNativeClipboard = !!NativeModules.RNCClipboard;
    if (hasNativeClipboard) {
      try {
        const Clipboard = require('@react-native-clipboard/clipboard').default;
        Clipboard.setString(shareLink);
        Toast.show({
          type: 'success',
          text1: '링크가 복사되었습니다.',
          position: 'top',
          visibilityTime: 1500,
        });
        return;
      } catch (e) {
        console.warn('Failed to copy to native clipboard:', e);
      }
    }

    console.warn(
      'Native RNCClipboard module not available. Falling back to native Share API.',
    );
    handleShareLink();
  };

  const handleShareLink = async () => {
    if (!shareLink) return;
    try {
      await Share.share({
        message: `[PlanMate] 완성된 여행 일정 링크예요!\n${shareLink}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const fetchEditors = useCallback(
    async (signal?: AbortSignal) => {
      if (isMock) {
        setEditors(prev =>
          prev.length === 0
            ? [
                { userId: 1, nickname: '홍길동' },
                { userId: 2, nickname: '김철수' },
              ]
            : prev,
        );
        return;
      }
      try {
        const response = await getEditors(planId, signal);
        if (signal?.aborted) return;
        setEditors(Array.isArray(response) ? response : []);
      } catch (error) {
        if (signal?.aborted) return;
        console.error('Failed to fetch editors:', error);
      }
    },
    [isMock, planId],
  );

  useEffect(() => {
    const controller = new AbortController();
    if (visible && planId) {
      setEditors([]);
      void fetchShareLink(controller.signal);
      void fetchEditors(controller.signal);
    }
    return () => controller.abort();
  }, [visible, planId, fetchShareLink, fetchEditors]);

  const handleInvite = () => {
    const receiverNickname = nickname.trim();

    const lengthError = getNicknameLengthError(receiverNickname);
    if (lengthError) {
      showAlert({ title: '오류', message: lengthError });
      return;
    }

    const targetPlanId = planId;
    return inviteLock.runExclusive(async () => {
      try {
        if (isMock) {
          await new Promise(resolve => setTimeout(resolve, 600));
          if (currentPlanIdRef.current !== targetPlanId) return;
          setEditors(prev => [
            ...prev,
            { userId: String(Date.now()), nickname: receiverNickname },
          ]);
          showAlert({
            title: '성공',
            message: '초대를 보냈습니다.',
          });
          setNickname('');
        } else {
          await inviteEditor(targetPlanId, receiverNickname);
          if (currentPlanIdRef.current !== targetPlanId) return;
          showAlert({
            title: '성공',
            message: '초대를 보냈습니다.',
          });
          setNickname('');
          fetchEditors();
        }
      } catch (error) {
        if (currentPlanIdRef.current !== targetPlanId) return;
        console.error('Invite failed:', error);

        const { code } = parseBackendError(error);
        if (code === ALREADY_MEMBER_CODE) {
          showAlert({
            title: '이미 참여 중',
            message: '이미 이 일정의 편집 권한이 있는 사용자예요.',
          });
        } else if (code === DUPLICATE_PENDING_CODE) {
          showAlert({
            title: '초대 대기 중',
            message:
              '이미 초대를 보낸 사용자예요. 상대방의 수락을 기다려 주세요.',
          });
        } else {
          showAlert({
            title: '오류',
            message: getDisplayErrorMessage(
              error,
              '사용자를 초대하지 못했어요. 닉네임을 확인해 주세요.',
            ),
          });
        }
      }
    });
  };

  const handleRemoveEditor = async (userId: number) => {
    showAlert({
      title: '편집자 삭제',
      message: '해당 사용자의 편집 권한을 삭제하시겠습니까?',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isMock) {
                setEditors(prev => prev.filter(e => e.userId !== userId));
              } else {
                await removeEditor(planId, userId);
                fetchEditors();
              }
            } catch (error) {
              console.error('Remove editor failed:', error);
              showAlert({
                title: '오류',
                message: '편집자를 삭제하지 못했어요.',
              });
            }
          },
        },
      ],
    });
  };

  return (
    <PopupModal
      visible={visible}
      title="공유 및 초대"
      onClose={onClose}
      doneLabel="확인"
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.groupTitle}>링크로 공유</Text>
        <View style={styles.sharePanel}>
          <View style={styles.switchRow}>
            <View
              style={[styles.statusIcon, !isShared && styles.statusIconOff]}
            >
              {isShared ? (
                <Link2 size={normalize(18)} color={tokens.colors.primary} />
              ) : (
                <Lock
                  size={normalize(18)}
                  color={tokens.colors.textSecondary}
                />
              )}
            </View>
            <View style={styles.statusBody}>
              <Text style={styles.switchLabel}>
                {isShared ? '링크가 있는 모든 사용자' : '제한됨'}
              </Text>
              <Text style={styles.statusDescription}>
                {isShared
                  ? '링크를 아는 사람은 일정을 볼 수 있어요.'
                  : '초대받은 사용자만 일정에 접근할 수 있어요.'}
              </Text>
            </View>
            {isOwner && (
              <Switch
                accessibilityLabel="공유 링크 사용"
                value={isShared}
                onValueChange={handleToggleShare}
                disabled={shareStatusLock.isSubmitting}
                accessibilityState={{
                  disabled: shareStatusLock.isSubmitting,
                }}
                trackColor={{
                  false: tokens.colors.borderStrong,
                  true: tokens.colors.primary,
                }}
                thumbColor={tokens.colors.white}
              />
            )}
          </View>

          <View style={styles.linkRow}>
            <Text
              style={styles.linkInput}
              numberOfLines={1}
              ellipsizeMode="tail"
              accessibilityLabel="공유 링크"
            >
              {shareLink}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="공유 링크 복사"
            >
              <Copy size={normalize(14)} color={tokens.colors.primary} />
              <Text style={styles.copyText}>링크 복사</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareLink}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="공유 링크 보내기"
          >
            <Text style={styles.shareText}>링크 공유하기</Text>
          </TouchableOpacity>
          <Text style={styles.helper}>
            링크를 복사하거나 공유하여 친구들에게 보내세요.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>일정 편집 초대</Text>
        <View style={styles.inviteRow}>
          <TextInput
            style={styles.input}
            placeholder="닉네임"
            placeholderTextColor={tokens.colors.textTertiary}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[
              styles.inviteButton,
              inviteLock.isSubmitting && styles.inviteButtonOff,
            ]}
            onPress={handleInvite}
            disabled={inviteLock.isSubmitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: inviteLock.isSubmitting }}
          >
            {inviteLock.isSubmitting ? (
              <ActivityIndicator color={tokens.colors.white} size="small" />
            ) : (
              <Text style={styles.inviteText}>초대</Text>
            )}
          </TouchableOpacity>
        </View>

        {editors.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              편집 권한이 있는 사용자 · {editors.length}명
            </Text>
            {editors.map((editor: any) => (
              <View key={editor.userId} style={styles.editorRow}>
                <View style={styles.editorInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {editor.nickname ? editor.nickname.charAt(0) : '?'}
                    </Text>
                  </View>
                  <Text style={styles.editorName} numberOfLines={1}>
                    {editor.nickname}
                  </Text>
                </View>
                {isOwner && (
                  <TouchableOpacity
                    onPress={() => handleRemoveEditor(editor.userId)}
                    style={styles.removeButton}
                    accessibilityRole="button"
                    accessibilityLabel={`${editor.nickname} 편집 권한 삭제`}
                  >
                    <Text style={styles.removeText}>삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  groupTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textLabel,
    marginBottom: normalize(10),
  },
  sharePanel: {
    padding: normalize(12),
    borderRadius: normalize(14),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  statusIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: tokens.colors.sub,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconOff: {
    backgroundColor: tokens.colors.border,
  },
  statusBody: {
    flex: 1,
  },
  statusDescription: {
    marginTop: normalize(4),
    fontSize: normalize(12),
    lineHeight: normalize(18),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: normalize(12),
    gap: normalize(8),
  },
  switchLabel: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  // 주소와 복사 단추를 한 테두리 안에 넣어 둘이 한 덩이로 읽히게 한다.
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: normalize(4),
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(9),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    textAlign: 'left',
  },
  copyButton: {
    minHeight: normalize(44),
    paddingHorizontal: normalize(10),
    flexDirection: 'row',
    gap: normalize(5),
    borderRadius: normalize(7),
    backgroundColor: tokens.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  shareButton: {
    marginTop: normalize(8),
    height: normalize(44),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.primary,
    borderWidth: 1,
    borderColor: tokens.colors.sub,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.white,
  },
  helper: {
    marginTop: normalize(6),
    fontSize: normalize(12),
    lineHeight: normalize(18),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  // 이름표가 곧 칸막이다. 위에 실선을 얹어 따로 divider를 두지 않는다.
  sectionLabel: {
    marginTop: normalize(16),
    paddingTop: normalize(14),
    marginBottom: normalize(8),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textLabel,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  input: {
    flex: 1,
    height: normalize(44),
    backgroundColor: tokens.colors.surface,
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(14),
    paddingVertical: 0,
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
  inviteButton: {
    height: normalize(44),
    minWidth: normalize(72),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonOff: {
    opacity: 0.6,
  },
  inviteText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(10),
    marginBottom: normalize(6),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.surface,
  },
  editorInfo: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  avatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: tokens.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  editorName: {
    flexShrink: 1,
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  removeButton: {
    paddingVertical: normalize(8),
    paddingLeft: normalize(12),
  },
  removeText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.tones.danger.fg,
  },
});
