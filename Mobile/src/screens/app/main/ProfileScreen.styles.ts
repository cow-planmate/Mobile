import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  error: '#FF3B30',
  surface: '#F9FAFB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  editIconContainer: {
    marginLeft: 6,
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardIcon: {
    width: 32,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  changeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    textDecorationLine: 'underline',
  },
  deleteLinkText: {
    color: COLORS.error,
  },
});
