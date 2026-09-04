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
    backgroundColor: tokens.colors.white,
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
    borderRadius: normalize(8),
    paddingHorizontal: normalize(11),
    height: normalize(38),
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
  // 탭바 가운데가 이미 만들기 버튼이다. 여기까지 파란 덩어리를 둘 이유가 없다.
  writeButton: {
    paddingHorizontal: normalize(2),
  },
  writeButtonText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
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

  // 정렬도 게시판 탭과 같은 밑줄 형태로 맞춘다. 알약을 섞지 않는다.
  sortRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(18),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(11),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  sortTab: {
    paddingBottom: normalize(9),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  sortTabOn: {
    borderBottomColor: tokens.colors.text,
  },
  sortTabText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  sortTabTextOn: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },

  postList: {
    paddingBottom: normalize(32),
  },
  // 카드 테두리 대신 전체 폭 구분선 하나로 나눈다. 여행기 목록과 같은 틀이다.
  postRow: {
    flexDirection: 'row',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  postRowPressed: {
    backgroundColor: tokens.colors.surface,
  },
  postFootRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: normalize(10),
    marginTop: normalize(6),
  },
  postMeta: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  postCounts: {
    flex: 0,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  postCountsOn: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
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
  thumbnailFallback: {
    backgroundColor: tokens.colors.surface,
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
