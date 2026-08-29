import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const FONTS = tokens.fontFamily;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  heroCarouselSection: {
    marginTop: normalize(12),
  },
  heroCardList: {
    paddingVertical: normalize(4),
  },
  heroCard: {
    aspectRatio: 16 / 9,
    borderRadius: normalize(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.border,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(11),
  },
  heroImageWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  heroImage: {
    width: '120%',
    height: '100%',
    position: 'absolute',
    left: '-10%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroInfo: {
    zIndex: 2,
  },
  placeTitle: {
    fontSize: normalize(22),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.white,
    lineHeight: normalize(26),
    letterSpacing: -0.6,
  },
  placeRoman: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.66)',
    letterSpacing: 1.8,
    marginTop: normalize(2),
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(12),
    height: normalize(3),
  },
  progressTrack: {
    width: normalize(50),
    height: normalize(3),
    backgroundColor: tokens.colors.border,
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  progressThumb: {
    width: normalize(10),
    height: '100%',
    backgroundColor: tokens.colors.primary,
    borderRadius: 2,
  },

  actionContainer: {
    marginTop: normalize(14),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(40),
  },
  cardWrapper: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.xl,
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(16),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    position: 'relative',
  },
  timelineTrack: {
    position: 'absolute',
    left: normalize(27),
    top: normalize(28),
    bottom: normalize(28),
    width: 2,
    backgroundColor: tokens.colors.borderLight,
    zIndex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    position: 'relative',
    zIndex: 2,
  },
  timelineRowLast: {
    paddingBottom: 0,
  },
  timelineDot: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.white,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  timelineDotFilled: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  timelineDotText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  timelineDotTextFilled: {
    color: tokens.colors.white,
  },
  timelineContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    paddingBottom: normalize(8),
  },
  timelineContentLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  label: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: -0.2,
    marginBottom: normalize(2),
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  placeholderText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.regular,
    fontWeight: '400',
    color: '#94A3B8',
    letterSpacing: -0.3,
  },
  rowIcon: {
    marginLeft: normalize(8),
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    height: normalize(54),
    borderRadius: tokens.radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(14),
  },
  submitButtonText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
    letterSpacing: -0.3,
  },
  submitButtonDisabled: {
    backgroundColor: tokens.colors.borderLight,
  },
  submitButtonTextDisabled: {
    color: tokens.colors.textTertiary,
  },
});
