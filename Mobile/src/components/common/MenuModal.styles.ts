import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  optionRow: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  destructiveText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
