import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F3F4F6',
  selectedBg: '#1344FF',
  selectedText: '#FFFFFF',
  unselectedBg: '#F3F4F6',
  unselectedText: '#374151',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 10,
    backgroundColor: COLORS.unselectedBg,
  },
  keywordButtonSelected: {
    backgroundColor: COLORS.selectedBg,
  },
  keywordText: {
    fontSize: 14,
    color: COLORS.unselectedText,
    fontWeight: '500',
  },
  keywordTextSelected: {
    color: COLORS.selectedText,
  },
  counter: {
    textAlign: 'center',
    fontSize: 13,
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
    color: COLORS.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  prevButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
