import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
  chipBg: '#EEF2FF',
  chipBorder: '#C7D2FE',
  chipText: '#3B5BDB',
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.lightGray,
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
    fontWeight: '700',
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
    fontWeight: '500',
    color: COLORS.chipText,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.placeholder,
  },
  selectButton: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
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
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  selectButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    minWidth: 72,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
