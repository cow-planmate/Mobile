import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  border: '#E5E5EA',
  white: '#FFFFFF',
  placeholder: '#8E8E93',
  background: 'rgba(0,0,0,0.5)',
  lightGray: '#F5F5F7',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: '500',
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
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
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
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  icon: {
    fontSize: 12,
    color: COLORS.text,
  },
});
