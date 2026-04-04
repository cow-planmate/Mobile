import { StyleSheet, Platform, Dimensions, PixelRatio } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: normalize(40),
  },

  /* ── Header Top (Logo, Avatar, Nickname & Bell) ── */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(48) : normalize(10),
    paddingBottom: normalize(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  userAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: normalize(-2),
    right: normalize(-2),
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },

  /* ── Page Header ── */
  pageHeader: {
    paddingTop: normalize(20),
    paddingBottom: normalize(20),
    paddingHorizontal: normalize(20),
    backgroundColor: theme.colors.background,
  },
  pageTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  pageTitle: {
    fontSize: normalize(24),
    fontFamily: FONTS.bold,
    color: theme.colors.text,
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  headerPlanCountText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#868B94',
  },
  multiDeleteButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    backgroundColor: '#E8EDFF',
    marginLeft: normalize(10),
  },
  multiDeleteButtonText: {
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
    color: theme.colors.primary,
  },
  pageSubtitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: '#868B94',
    marginTop: normalize(4),
  },

  /* ── Section ── */
  sectionWrapper: {
    marginTop: normalize(16),
    backgroundColor: theme.colors.white,
    borderRadius: normalize(16),
    marginHorizontal: normalize(16),
    borderWidth: 1,
    borderColor: '#EAECEF',
    marginBottom: normalize(16),
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: normalize(8),
  },
  sectionRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  sectionInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  sectionCountText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#868B94',
  },
  sectionSubtitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: '#868B94',
  },

  /* ── List Content ── */
  sectionListContent: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(20),
  },

  /* ── Itinerary Card ── */
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(12),
    padding: normalize(12),
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: '#EAECEF',
  },
  itineraryIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(8),
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: normalize(2),
  },
  itinerarySubtitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#868B94',
  },
  moreButton: {
    padding: normalize(4),
  },

  /* ── Empty ── */
  emptyContainer: {
    paddingVertical: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(10),
  },
  emptyText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: theme.colors.textSecondary,
  },

  /* ── Separator ── */
  sectionSeparator: {
    height: normalize(8),
    backgroundColor: theme.colors.surface,
    marginTop: normalize(8),
  },
  sectionSubtitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#868B94',
    marginBottom: normalize(12),
    marginTop: -normalize(8),
  },
});
