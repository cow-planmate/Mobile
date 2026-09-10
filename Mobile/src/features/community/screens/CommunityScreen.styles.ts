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

  // 글쓰기가 FAB로 빠져 검색칸이 폭 전체를 쓴다. 치수는 웹 SearchBar와 같다.
  searchBarRow: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    backgroundColor: tokens.colors.white,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFD',
    borderWidth: 1,
    borderColor: '#D9DCE2',
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(14),
    height: normalize(48),
  },
  searchIcon: {
    marginRight: normalize(10),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    padding: 0,
  },

  // 웹은 3열 그리드지만 360dp에 세 칸은 못 넣는다. 가로로 굴려 다음 장이 살짝 보이게 한다.
  hotSection: {
    backgroundColor: tokens.colors.white,
    paddingTop: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  hotHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: normalize(8),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(11),
  },
  hotHeadTitle: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.4,
  },
  hotHeadSub: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  hotStrip: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
    gap: normalize(10),
  },
  hotCard: {
    flexDirection: 'row',
    gap: normalize(10),
    width: normalize(290),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(12),
    backgroundColor: tokens.colors.white,
  },
  hotCardPressed: {
    backgroundColor: tokens.colors.surface,
  },
  // 1위만 본색, 2·3위는 한 단계 눕힌다 — 웹 HotPostCard와 같다.
  hotRank: {
    fontSize: normalize(20),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
    lineHeight: normalize(22),
  },
  hotRankRest: {
    color: '#7390FF',
  },
  hotBody: {
    flex: 1,
  },
  hotCardTitle: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    lineHeight: normalize(19),
    letterSpacing: -0.3,
  },
  hotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    marginTop: normalize(8),
  },
  hotMeta: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: '#6B7280',
  },

  // 게시판 전환은 밑줄, 정렬은 알약. 모양으로 갈려야 둘이 다른 일이라는 게 읽힌다.
  sortTrack: {
    flexDirection: 'row',
    gap: normalize(2),
    marginHorizontal: normalize(16),
    marginTop: normalize(12),
    padding: normalize(4),
    borderRadius: tokens.radius.l,
    backgroundColor: '#F1F1F3',
  },
  sortPill: {
    flex: 1,
    height: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.m,
  },
  sortPillOn: {
    backgroundColor: tokens.colors.white,
    ...tokens.shadows.sm,
  },
  sortPillText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: '#454A55',
  },
  sortPillTextOn: {
    color: tokens.colors.primary,
  },
  // 머리와 목록 사이 회색 띠. 흰 덩어리 둘이 맞붙지 않게 한다.
  listHeaderGap: {
    height: normalize(12),
    backgroundColor: tokens.colors.surface,
  },

  postList: {
    paddingBottom: normalize(96),
  },

  // 여행기 createButton과 같은 값(높이 48 · 오른쪽 20 · 아래 20).
  // 그림자는 tokens.shadows.md 하나만 쓴다 — 안드로이드는 elevation만 읽는다.
  fab: {
    position: 'absolute',
    right: normalize(20),
    bottom: normalize(20),
    height: normalize(48),
    paddingHorizontal: normalize(20),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(7),
    ...tokens.shadows.md,
  },
  fabText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
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
