import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { submitFeedback, FEEDBACK_EMPTY_MESSAGE } from '../../../api/feedback';
import PopupModal from '../../../components/common/PopupModal';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleClose = () => {
    if (!isSubmittingRef.current) onClose();
  };

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
    <PopupModal
      visible={visible}
      title="피드백 보내기"
      onClose={handleClose}
      footer={
        <TouchableOpacity
          accessibilityLabel="피드백 제출"
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.submit, isSubmitting && styles.submitOff]}
          activeOpacity={0.85}
          accessibilityState={{ disabled: isSubmitting }}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? '보내는 중…' : '보내기'}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.body}>
        <Text style={styles.description}>
          쓰면서 불편했던 점이나 고츠면 좋겠다 싶은 것을 적어 주세요.
        </Text>
        <TextInput
          accessibilityLabel="피드백 내용"
          autoFocus
          editable={!isSubmitting}
          multiline
          onChangeText={setContent}
          placeholder="어떤 점이 불편했나요?"
          placeholderTextColor={tokens.colors.textTertiary}
          style={styles.input}
          value={content}
        />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  description: {
    marginBottom: normalize(10),
    fontSize: normalize(13),
    lineHeight: normalize(19),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  input: {
    minHeight: normalize(120),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
    fontSize: normalize(13.5),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    textAlignVertical: 'top',
  },
  submit: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitOff: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
