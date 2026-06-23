import { StyleSheet, Platform, Dimensions } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const { width } = Dimensions.get('window');
export const COLORS = theme.colors;

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackMapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  fallbackMapText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginTop: normalize(12),
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? normalize(60) : normalize(30),
    width: '90%',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: normalize(24),
    paddingHorizontal: normalize(16),
    height: normalize(48),
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: normalize(8),
    fontSize: normalize(14),
    color: COLORS.text,
    padding: 0,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: normalize(20),
    height: normalize(150),
    width: '100%',
    zIndex: 10,
  },
  carouselScroll: {
    paddingHorizontal: normalize(16),
    gap: normalize(12),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    width: width * 0.8,
    height: normalize(130),
    padding: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: normalize(106),
    height: normalize(106),
    borderRadius: normalize(12),
    backgroundColor: COLORS.sub,
  },
  cardInfo: {
    flex: 1,
    marginLeft: normalize(12),
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontSize: normalize(11),
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: normalize(2),
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
  },
  cardRating: {
    fontSize: normalize(12),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginLeft: normalize(4),
    fontWeight: '600',
  },
  cardReviews: {
    fontSize: normalize(12),
    color: COLORS.textTertiary,
    marginLeft: normalize(4),
  },
  cardAddress: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    marginTop: normalize(4),
  },
});
