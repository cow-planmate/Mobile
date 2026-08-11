import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  mutedText: '#6B7280',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  white: '#FFFFFF',
};

export const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  description: {
    marginBottom: 16,
    color: COLORS.mutedText,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 144,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: COLORS.white,
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    fontWeight: '700',
  },
});
