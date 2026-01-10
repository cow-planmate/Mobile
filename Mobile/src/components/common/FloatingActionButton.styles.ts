import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
};

export const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    color: COLORS.white,
    fontSize: 36,
    lineHeight: 40,
  },
});
