import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '80%',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  counterLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterButtonText: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  confirmButton: {
    width: '100%',
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
  },
});
