import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  white: '#FFFFFF',
  lightGray: '#F0F0F0',
  text: '#1C1C1E',
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginHorizontal: 5,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
