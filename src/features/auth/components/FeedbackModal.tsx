import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import PopupModal from '../../../components/common/PopupModal';
import { FEEDBACK_MAX_LENGTH, submitFeedback } from '../../../api/feedback';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (visible) {
      setContent('');
      setIsSending(false);
    }
  }, [visible]);

  const canSend = content.trim().length > 0 && !isSending;

  // 실패하면 닫지 않는다. 길게 적은 내용이 사라지면 다시 쓸 마음이 안 든다.
  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      await submitFeedback(content);
      Toast.show({
        type: 'success',
        text1: '의견을 보냈어요. 감사합니다!',
        position: 'top',
        visibilityTime: 2500,
      });
      onClose();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '의견을 보내지 못했어요.'),
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PopupModal
      visible={visible}
      title="의견 보내기"
      onClose={onClose}
      footer={
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="의견 보내기"
          accessibilityState={{ disabled: !canSend }}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={tokens.colors.white} />
          ) : (
            <Text
              style={[
                styles.sendButtonText,
                !canSend && styles.sendButtonTextDisabled,
              ]}
            >
              보내기
            </Text>
          )}
        </TouchableOpacity>
      }
    >
      <View style={styles.group}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="불편한 점이나 개선 아이디어를 적어주세요"
          placeholderTextColor={tokens.colors.textTertiary}
          multiline
          textAlignVertical="top"
          maxLength={FEEDBACK_MAX_LENGTH}
          editable={!isSending}
          accessibilityLabel="의견 내용"
        />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  input: {
    height: normalize(140),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
    paddingTop: normalize(12),
    paddingBottom: normalize(12),
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
  sendButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: tokens.colors.disabled,
  },
  sendButtonText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  sendButtonTextDisabled: {
    color: tokens.colors.textSecondary,
  },
});
