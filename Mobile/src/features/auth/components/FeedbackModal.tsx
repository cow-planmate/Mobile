import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import X from 'lucide-react-native/dist/esm/icons/x';
import { submitFeedback, FEEDBACK_EMPTY_MESSAGE } from '../../../api/feedback';
import { styles } from './FeedbackModal.styles';
import { tokens } from '../../../theme/tokens';

type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (!content.trim()) {
      Toast.show({ type: 'error', text1: FEEDBACK_EMPTY_MESSAGE, position: 'top' });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitFeedback(content);
      setContent('');
      onClose();
      Toast.show({
        type: 'success',
        text1: '피드백을 보내주셔서 고마워요.',
        position: 'top',
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      Toast.show({
        type: 'error',
        text1: message || '피드백을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
        position: 'top',
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <View style={styles.header}>
              <Text style={styles.title}>피드백 보내기</Text>
              <TouchableOpacity
                accessibilityLabel="피드백 입력 닫기"
                disabled={isSubmitting}
                onPress={onClose}
                style={styles.closeButton}
                accessibilityState={{ disabled: isSubmitting }}
              >
                <X size={20} color={tokens.colors.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>
              서비스 이용 중 불편했던 점이나 개선 의견을 알려주세요.
            </Text>
            <TextInput
              accessibilityLabel="피드백 내용"
              autoFocus
              editable={!isSubmitting}
              multiline
              onChangeText={setContent}
              placeholder="피드백을 입력해 주세요."
              placeholderTextColor={tokens.colors.textTertiary}
              style={styles.input}
              value={content}
            />
            <TouchableOpacity
              accessibilityLabel="피드백 제출"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              accessibilityState={{ disabled: isSubmitting }}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '보내는 중…' : '보내기'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
