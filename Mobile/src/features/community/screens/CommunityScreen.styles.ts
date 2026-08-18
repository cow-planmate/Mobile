import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  textTertiary: tokens.colors.textTertiary,
  border: tokens.colors.border,
  background: tokens.colors.background,
  surface: tokens.colors.surface,
  white: tokens.colors.white,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },

  listHeaderContainer: {
    backgroundColor: tokens.colors.surface,
  },

  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    gap: normalize(8),
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(14),
    height: normalize(42),
  },
  searchIcon: {
    marginRight: normalize(8),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    padding: 0,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(14),
    height: normalize(42),
  },
  writeIcon: {
    marginRight: normalize(4),
  },
  writeButtonText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },

  hotSectionContainer: {
    paddingTop: normalize(18),
  },
  hotHeaderRow: {
    paddingHorizontal: normalize(16),
    marginBottom: normalize(10),
  },
  hotIconWrap: {
    backgroundColor: tokens.tones.hot.bg,
    borderRadius: tokens.radius.m,
    padding: normalize(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotListScroll: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
    gap: normalize(10),
  },
  hotPostCard: {
    flexDirection: 'row',
    width: normalize(290),
  },
  hotCardLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hotRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(6),
  },
  hotRankNum: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.tones.hot.fg,
  },
  hotViewsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
    marginLeft: 'auto',
  },
  hotViewsText: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  hotCardTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    marginBottom: normalize(10),
  },
  hotCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: normalize(8),
  },
  hotCardAuthorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  hotAuthorText: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  hotLikesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
    backgroundColor: tokens.tones.hot.bg,
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: tokens.radius.s,
  },
  hotLikesText: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.tones.hot.fg,
  },
  hotCardRight: {
    marginLeft: normalize(10),
  },
  hotThumbnail: {
    width: normalize(66),
    height: normalize(66),
    borderRadius: tokens.radius.m,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(18),
    paddingBottom: normalize(2),
  },

  postList: {
    paddingBottom: normalize(32),
  },
  postCard: {
    flexDirection: 'row',
    marginHorizontal: normalize(16),
    marginTop: normalize(10),
  },
  postLeftSection: {
    flex: 1,
  },
  postTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    marginBottom: normalize(6),
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  authorName: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  postTime: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  postStatsRow: {
    marginTop: normalize(10),
    paddingTop: normalize(10),
  },
  postRightSection: {
    marginLeft: normalize(12),
  },
  thumbnailImage: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: tokens.radius.m,
  },

  listFooterLoading: {
    paddingVertical: normalize(20),
    alignItems: 'center',
  },
  listStateBox: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(20),
  },
});
