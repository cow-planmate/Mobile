import { StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  white: tokens.colors.white,
  border: tokens.colors.border,
  surface: tokens.colors.borderLight,
  selectedBg: tokens.colors.primary,
  selectedText: tokens.colors.white,
  unselectedBg: tokens.colors.borderLight,
  unselectedText: '#374151',
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
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
    maxHeight: '85%',
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
    flexGrow: 1,
    flexShrink: 1,
  },
});
