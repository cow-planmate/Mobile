import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  border: '#E5E7EB',
  white: '#FFFFFF',
  placeholder: '#9CA3AF',
  background: 'rgba(0,0,0,0.5)',
  surface: '#F3F4F6',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  modalView: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'left',
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dayText: {
    flex: 0.8,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  dateInput: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  timeInput: {
    flex: 1.2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlButtonText: {
    fontSize: 20,
    color: COLORS.text,
    fontFamily: FONTS.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 12,
    color: COLORS.text,
  },
});
