import { StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  white: tokens.colors.white,
  border: tokens.colors.border,
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
