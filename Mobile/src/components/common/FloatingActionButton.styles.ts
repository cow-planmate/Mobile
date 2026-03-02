import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  white: '#FFFFFF',
  border: '#E5E7EB',
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
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  icon: {
    color: COLORS.white,
    fontSize: 36,
    lineHeight: 40,
  },
});
