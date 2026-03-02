import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  selectedBg: '#1344FF',
  selectedText: '#FFFFFF',
  unselectedBg: '#F3F4F6',
  unselectedText: '#374151',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '92%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  keywordButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.unselectedBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keywordButtonSelected: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.selectedBg,
  },
  keywordText: {
    fontSize: 14,
    color: COLORS.unselectedText,
    fontFamily: FONTS.medium,
  },
  keywordTextSelected: {
    color: COLORS.selectedText,
  },
  counter: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  prevButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prevButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.white,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 0,
  },
});
