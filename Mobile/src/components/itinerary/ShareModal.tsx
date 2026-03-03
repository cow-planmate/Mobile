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
} from 'react-native';
import { X } from 'lucide-react-native';
import {
  getShareUrl,
  inviteEditor,
  getEditors,
  removeEditor,
} from '../../api/trips';
import { theme } from '../../theme/theme';
import { useAlert } from '../../contexts/AlertContext';

const COLORS = theme.colors;
const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  planId: number;
}

export default function ShareModal({
  visible,
  onClose,
  planId,
}: ShareModalProps) {
  const { showAlert } = useAlert();
  const [shareLink, setShareLink] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [editors, setEditors] = useState<any[]>([]);

  useEffect(() => {
    if (visible && planId) {
      fetchShareLink();
      fetchEditors();
    }
  }, [visible, planId]);

  const fetchShareLink = async () => {
    try {
      const response = await getShareUrl(planId);
      setShareLink(response.shareUrl);
    } catch (error) {
      console.error('Failed to fetch share link:', error);
    }
  };

  const fetchEditors = async () => {
    try {
      const response = await getEditors(planId);
      // Ensure response is an array, handle potential nested structures if any
      const editorsList = Array.isArray(response)
        ? response
        : (response as any).editors || [];
      setEditors(editorsList);
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
      await inviteEditor(planId, nickname);
      showAlert({ title: '성공', message: `${nickname}님을 초대했습니다.` });
      setNickname('');
      fetchEditors();
    } catch (error) {
      console.error('Invite failed:', error);
      showAlert({
        title: '오류',
        message: '사용자를 초대하지 못했습니다. 닉네임을 확인해주세요.',
      });
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
              await removeEditor(planId, userId);
              fetchEditors();
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
            <Text style={styles.label}>공유 링크 (읽기 전용)</Text>
            <View style={styles.linkContainer}>
              <TextInput
                style={styles.linkInput}
                value={shareLink}
                editable={false}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.helperText}>
              링크를 복사해서 친구들에게 공유하세요.
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
                  <TouchableOpacity
                    onPress={() => handleRemoveEditor(editor.userId)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>삭제</Text>
                  </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    paddingVertical: 16,
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
});
