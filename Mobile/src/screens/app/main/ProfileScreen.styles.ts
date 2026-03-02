import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  sub: '#E8EDFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  error: '#EF4444',
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
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  scrollContainer: {
    paddingBottom: 40,
  },

  /* ── Profile Header ── */
  profileHeader: {
    backgroundColor: COLORS.white,
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.sub,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  editBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 4,
  },

  /* ── Sections ── */
  sectionContainer: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.placeholder,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* ── Info Row ── */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  infoAction: {
    paddingHorizontal: 4,
  },
  infoActionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 64,
  },

  /* ── Danger Zone ── */
  dangerSection: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dangerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  dangerTextRed: {
    color: COLORS.error,
  },
});
