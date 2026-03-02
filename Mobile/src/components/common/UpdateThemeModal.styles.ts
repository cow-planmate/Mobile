import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  chipBg: '#EEF2FF',
  chipBorder: '#C7D2FE',
  chipText: '#3B5BDB',
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '75%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryScroll: {
    maxHeight: 200,
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    padding: 14,
    gap: 12,
  },
  categoryGroup: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  themeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 22,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.chipBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  themeChipText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.chipText,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
  selectButton: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  selectButtonText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  selectButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    minWidth: 72,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
