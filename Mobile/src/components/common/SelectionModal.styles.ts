import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F0F0',
  placeholder: '#8E8E93',
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: 24,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.placeholder,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
