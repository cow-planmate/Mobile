import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarButton: {
    width: normalize(40),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: normalize(15),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },
  submitButton: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: theme.borderRadius.m,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.white,
  },

  body: {
    padding: normalize(16),
    gap: normalize(16),
  },

  fieldLabel: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textLabel,
    marginBottom: normalize(7),
  },

  boardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(7),
  },
  boardChip: {
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(7),
    borderRadius: theme.borderRadius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  boardChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  boardChipText: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  boardChipTextActive: {
    color: COLORS.white,
  },

  input: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: normalize(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.text,
  },
  contentInput: {
    minHeight: normalize(220),
    textAlignVertical: 'top',
    lineHeight: normalize(21),
  },

  hint: {
    marginTop: normalize(6),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },
});
