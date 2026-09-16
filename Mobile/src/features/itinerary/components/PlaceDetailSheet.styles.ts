import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  body: {
    paddingBottom: normalize(16),
  },

  // 사진은 손가락으로 넘긴다. 화살표를 얹으면 사진을 가린다.
  photoStrip: {
    backgroundColor: COLORS.surface,
  },
  photo: {
    aspectRatio: 16 / 9,
  },
  photoEmpty: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    backgroundColor: COLORS.surface,
  },
  photoEmptyText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: normalize(12),
    color: COLORS.textTertiary,
  },
  photoCount: {
    position: 'absolute',
    right: normalize(12),
    bottom: normalize(12),
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.round,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  photoCountText: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(11),
    color: COLORS.white,
  },

  head: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(16),
    gap: normalize(6),
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.sub,
  },
  chipText: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(10.5),
    color: COLORS.primary,
  },
  name: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(18),
    lineHeight: normalize(25),
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(5),
  },
  address: {
    flex: 1,
    fontFamily: tokens.fontFamily.regular,
    fontSize: normalize(12),
    lineHeight: normalize(18),
    color: COLORS.textTertiary,
  },

  section: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: normalize(8),
  },
  sectionTitle: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(13),
    color: COLORS.text,
  },
  overview: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: normalize(12.5),
    lineHeight: normalize(20),
    color: COLORS.textLabel,
  },
  moreText: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(12),
    color: COLORS.primary,
  },

  // 대표 메뉴만 따로 세운다. 나머지는 알약으로 늘어놓는다.
  menuCard: {
    flexDirection: 'row',
    gap: normalize(10),
    padding: normalize(11),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.tones.warning.bg,
    backgroundColor: tokens.tones.warning.bg,
  },
  menuLabel: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(10.5),
    color: tokens.tones.warning.fg,
  },
  menuName: {
    marginTop: normalize(2),
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(13),
    color: COLORS.text,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
  },
  pill: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.surface,
  },
  pillText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: normalize(12),
    color: COLORS.textLabel,
  },

  // 이용 정보는 한 줄씩. 두 칸으로 놓으면 좁은 폭에서 글자가 접힌다.
  infoRow: {
    flexDirection: 'row',
    gap: normalize(10),
    padding: normalize(11),
    borderRadius: tokens.radius.l,
    backgroundColor: COLORS.surface,
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(10.5),
    color: COLORS.textTertiary,
  },
  infoValue: {
    marginTop: normalize(2),
    fontFamily: tokens.fontFamily.medium,
    fontSize: normalize(12.5),
    lineHeight: normalize(19),
    color: COLORS.textLabel,
  },

  noticeRow: {
    gap: normalize(3),
    paddingVertical: normalize(7),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  noticeName: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(11.5),
    color: COLORS.textTertiary,
  },
  noticeText: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: normalize(12.5),
    lineHeight: normalize(19),
    color: COLORS.textLabel,
  },
  roomCard: {
    padding: normalize(12),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: normalize(3),
  },
  roomTitle: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(13),
    color: COLORS.text,
  },
  roomMeta: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: normalize(12),
    color: COLORS.textTertiary,
  },
  homepage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    marginHorizontal: normalize(16),
    marginTop: normalize(14),
    paddingVertical: normalize(12),
    borderRadius: tokens.radius.l,
    backgroundColor: COLORS.text,
  },
  homepageText: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(12.5),
    color: COLORS.white,
  },

  state: {
    minHeight: normalize(220),
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(10),
    paddingHorizontal: normalize(28),
  },
  stateText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: normalize(13),
    lineHeight: normalize(20),
    textAlign: 'center',
    color: COLORS.textSecondary,
  },

  foot: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  footButton: {
    flex: 1,
    minHeight: normalize(46),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footButtonText: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: normalize(13),
    color: COLORS.textSecondary,
  },
  footPrimary: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  footPrimaryText: {
    color: COLORS.white,
  },
});
