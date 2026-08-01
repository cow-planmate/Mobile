import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Share,
  NativeModules,
  Switch,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { X } from 'lucide-react-native';
import {
  getShareUrl,
  getShareStatus,
  updateShareStatus,
  inviteEditor,
  getEditors,
  removeEditor,
} from '../../api/trips';
import { theme } from '../../theme/theme';
import { useAlert } from '../../contexts/AlertContext';

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

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
  isOwner = true,
}: ShareModalProps) {
  const { showAlert } = useAlert();
  const [shareLink, setShareLink] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShared, setIsShared] = useState(true);
  const [editors, setEditors] = useState<any[]>([]);

  useEffect(() => {
    if (visible && planId) {
      fetchShareLink();
      fetchEditors();
    }
  }, [visible, planId]);

  const fetchShareLink = async () => {
    if (isMock) {
      setShareLink('https://planmate.cow/share/mock-trip-123');
      setIsShared(true);
      return;
    }
    try {
      const response = await getShareUrl(planId);
      setShareLink(response.shareUrl);
      if (typeof response.isShared === 'boolean') {
        setIsShared(response.isShared);
      }
    } catch (error) {
      console.error('Failed to fetch share link:', error);
    }
  };

  const handleToggleShare = async (newValue: boolean) => {
    setIsShared(newValue);
    if (isMock) return;
    try {
      await updateShareStatus(planId, newValue);
      Toast.show({
        type: 'success',
        text1: newValue ? '일정 공유가 활성화되었습니다.' : '일정이 비공개로 변경되었습니다.',
        position: 'top',
        visibilityTime: 1500,
      });
    } catch (error) {
      console.error('Failed to update share status:', error);
      setIsShared(!newValue);
      showAlert({ title: '오류', message: '공유 상태 변경에 실패했습니다.' });
    }
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    
    // 1. 웹 브라우저 환경 (navigator.clipboard) 대응
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          Toast.show({
            type: 'success',
            text1: '링크가 복사되었습니다.',
            position: 'top',
            visibilityTime: 1500,
          });
        })
        .catch((err) => {
          console.warn('Web clipboard copy failed:', err);
          handleShareLink();
        });
      return;
    }
    
    // 2. 모바일 네이티브 환경 대응
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
    
    // 3. 둘 다 지원되지 않는 환경에서는 Share API로 대체
    console.warn('Native RNCClipboard module not available. Falling back to native Share API.');
    handleShareLink();
  };

  const handleShareLink = async () => {
    if (!shareLink) return;
    try {
      await Share.share({
        message: `[PlanMate] 완성된 여행 일정 링크입니다!\n${shareLink}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const fetchEditors = async () => {
    if (isMock) {
      if (editors.length === 0) {
        setEditors([
          { userId: 1, nickname: '홍길동' },
          { userId: 2, nickname: '김철수' },
        ]);
      }
      return;
    }
    try {
      const response = await getEditors(planId);
      setEditors(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch editors:', error);
    }
  };

  const handleInvite = async () => {
    if (!nickname.trim()) {
      showAlert({ title: '오류', message: '닉네임을 입력해주세요.' });
      return;
    }
    setLoading(true);
    try {
      if (isMock) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setEditors(prev => [...prev, { userId: Date.now(), nickname }]);
        showAlert({ title: '성공', message: `${nickname}님을 초대했습니다.` });
        setNickname('');
      } else {
        await inviteEditor(planId, nickname);
        showAlert({ title: '성공', message: `${nickname}님을 초대했습니다.` });
        setNickname('');
        fetchEditors();
      }
    } catch (error: any) {
      console.error('Invite failed:', error);
      const isConflict = error?.response?.status === 409;
      if (isConflict) {
        showAlert({
          title: '초대 대기 중',
          message: '이미 초대를 보낸 사용자입니다. 상대방의 수락을 기다려주세요.',
        });
      } else {
        showAlert({
          title: '오류',
          message: '사용자를 초대하지 못했습니다. 닉네임을 확인해주세요.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEditor = async (userId: number) => {
    showAlert({
      title: '편집자 삭제',
      message: '정말 이 사용자의 편집 권한을 삭제하시겠습니까?',
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
                message: '편집자 삭제에 실패했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>일정 공유 및 초대</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            {isOwner && (
              <View style={styles.switchRow}>
                <Text style={styles.label}>공유 활성화 (읽기 전용)</Text>
                <Switch
                  value={isShared}
                  onValueChange={handleToggleShare}
                  trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}
            <View style={styles.linkContainer}>
              <TextInput
                style={styles.linkInput}
                value={shareLink}
                editable={false}
                selectTextOnFocus
              />
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
                <Text style={styles.copyButtonText}>복사</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareLink}>
              <Text style={styles.shareButtonText}>링크 공유하기</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              링크를 복사하거나 공유하여 친구들에게 보내세요.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>함께 편집할 친구 초대</Text>
            <View style={styles.inviteContainer}>
              <TextInput
                style={styles.input}
                placeholder="친구 닉네임 입력"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.inviteButton, loading && styles.disabledButton]}
                onPress={handleInvite}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.inviteButtonText}>초대</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {editors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>참여 중인 편집자</Text>
              {editors.map((editor: any) => (
                <View key={editor.userId} style={styles.editorRow}>
                  <View style={styles.editorInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {editor.nickname ? editor.nickname.charAt(0) : '?'}
                      </Text>
                    </View>
                    <Text style={styles.editorName}>{editor.nickname}</Text>
                  </View>
                  {isOwner && (
                    <TouchableOpacity
                      onPress={() => handleRemoveEditor(editor.userId)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>닫기</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#6B7280',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    fontFamily: FONTS.regular,
  },
  copyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.semibold,
    fontSize: 13,
  },
  shareButton: {
    backgroundColor: '#EBF0FF',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D2DFFF',
  },
  shareButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  inviteContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#6B7280',
  },
  editorName: {
    fontSize: 14,
    color: '#111827',
    fontFamily: FONTS.regular,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: FONTS.medium,
  },
  confirmButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
