import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
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
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: COLORS.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: COLORS.placeholder,
  },
});
