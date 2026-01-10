import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
  gray: '#E5E5EA',
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.placeholder,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.placeholder,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  copyButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 14,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
  },
  inviteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyUserText: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
});
