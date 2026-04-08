import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  error: '#FF3B30',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '86%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    marginBottom: 4,
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  optionsContainer: {
    overflow: 'hidden',
  },
  optionRow: {
    minHeight: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    backgroundColor: COLORS.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#374151',
  },
  destructiveText: {
    color: COLORS.error,
    fontFamily: FONTS.semibold,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  cancelButton: {
    marginTop: 2,
    backgroundColor: COLORS.white,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    width: '100%',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
