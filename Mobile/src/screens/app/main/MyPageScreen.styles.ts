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
  profileIconText: {
    fontSize: 40,
    color: COLORS.placeholder,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  editIcon: {
    fontSize: 20,
    color: COLORS.text,
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardIcon: {
    width: 30,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginBottom: 2,
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
    marginLeft: 62,
  },
  linksContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    paddingVertical: 12,
  },
  deleteLinkText: {
    color: COLORS.error,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: -20,
    marginVertical: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 4,
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
  sectionCountIcon: {
    fontSize: 14,
  },
  actionButton: {
    marginLeft: 8,
  },
  sectionActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  itineraryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itineraryIcon: {
    // placeholder for lucide icon — no text styles needed
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  itinerarySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.placeholder,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
});
