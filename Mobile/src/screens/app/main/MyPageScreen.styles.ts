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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 40,
  },

  /* ── Page Header ── */
  pageHeader: {
    backgroundColor: COLORS.white,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 4,
  },

  /* ── Section ── */
  sectionWrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.sub,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 2,
    marginLeft: 40,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.sub,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  sectionActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  actionButton: {
    marginLeft: 8,
  },
  sectionActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },

  /* ── Itinerary Card ── */
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  itineraryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: 3,
  },
  itineraryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itinerarySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Empty ── */
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },

  /* ── Separator ── */
  sectionSeparator: {
    height: 8,
    backgroundColor: COLORS.surface,
    marginTop: 8,
  },
});
