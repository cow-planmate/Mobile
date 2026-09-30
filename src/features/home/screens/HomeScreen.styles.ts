import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const FONTS = tokens.fontFamily;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.pageGround,
  },
  scroll: {
    flex: 1,
    backgroundColor: tokens.colors.pageGround,
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
    borderRadius: normalize(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.border,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(11),
  },
  heroEmpty: {
    marginHorizontal: normalize(16),
    aspectRatio: 16 / 9,
    borderRadius: normalize(20),
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
  },
  heroEmptyTitle: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  heroEmptyDesc: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
    textAlign: 'center',
    lineHeight: normalize(18),
    marginTop: normalize(5),
  },
  relationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(9),
    paddingHorizontal: normalize(16),
  },
  relationLabel: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  relationRegion: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
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
  heroInfoWithCue: {
    paddingRight: normalize(126),
  },
  touchCueTag: {
    position: 'absolute',
    bottom: normalize(11),
    right: normalize(15),
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    paddingVertical: normalize(4.5),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  touchCueText: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.medium,
    fontWeight: '500',
    color: tokens.colors.white,
    letterSpacing: -0.2,
  },
  // 웹 히어로의 작은 라벨 자리. 웹은 대문자 로마자라 트래킹을 줬지만
  // 한글 문장에는 트래킹을 주지 않는다.
  placeAsk: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.78)',
    letterSpacing: -0.2,
    marginBottom: normalize(5),
  },
  placeTitle: {
    fontSize: normalize(24),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
    lineHeight: normalize(28),
    letterSpacing: -1,
  },
  // 지역명은 여러 지역을 섞어 보여줄 때만 앞에 붙는다. 여행지를 고른 뒤에는
  // 아래 설명 줄과 폼 카드가 이미 지역명을 말하므로 로마자만 남는다.
  placeCaption: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -0.2,
    marginTop: normalize(4),
  },
  placeRoman: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  progressTrack: {
    height: normalize(3),
    backgroundColor: tokens.colors.border,
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  progressThumb: {
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
    borderRadius: normalize(20),
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
    backgroundColor: tokens.colors.border,
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
    backgroundColor: tokens.colors.primarySurface,
    borderWidth: 2,
    borderColor: '#BFD3FF',
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
    color: tokens.colors.primary,
  },
  timelineDotTextFilled: {
    color: tokens.colors.white,
  },
  // 여행지·기간·인원수를 가르는 선. borderLight는 흰 바탕과 대비가 1.05:1이라
  // 사실상 보이지 않았다.
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
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    fontWeight: '500',
    color: tokens.colors.textLabel,
    letterSpacing: -0.2,
    marginBottom: normalize(2.5),
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  valueText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    fontWeight: '600',
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  placeholderText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.regular,
    fontWeight: '400',
    color: tokens.colors.textTertiary,
    letterSpacing: -0.3,
  },
  rowIcon: {
    marginLeft: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    height: normalize(54),
    borderRadius: normalize(18),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(14),
    gap: normalize(6),
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
    color: '#6B7280',
  },
});
