import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F7F8FA',
  darkGray: '#505050',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
  lightBlue: '#e6f0ff',
  iconBg: '#F5F7FF',
  shadow: '#1344FF',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '100%',
    height: height * 0.85,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: normalize(16),
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
    fontWeight: '400',
  },
  closeButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: normalize(16),
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(16),
    marginHorizontal: normalize(20),
    paddingHorizontal: normalize(4),
    height: normalize(56),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIconContainer: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  searchIcon: {
    fontSize: normalize(18),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    color: COLORS.text,
    height: '100%',
  },
  clearButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(4),
  },
  clearButtonText: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(16),
    gap: normalize(8),
  },
  loaderText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },
  resultListContainer: {
    paddingBottom: normalize(20),
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    marginHorizontal: normalize(4),
    marginVertical: normalize(4),
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: COLORS.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  resultIcon: {
    fontSize: normalize(18),
  },
  resultInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  resultName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: normalize(2),
  },
  resultAddress: {
    fontSize: normalize(12),
    color: COLORS.placeholder,
  },
  resultArrow: {
    fontSize: normalize(20),
    color: COLORS.border,
    marginLeft: normalize(8),
  },

  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  sectionContainer: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: normalize(24),
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: normalize(8),
  },
  sectionIcon: {
    fontSize: normalize(16),
    marginRight: normalize(8),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  tagButton: {
    paddingLeft: normalize(14),
    paddingRight: normalize(8),
    paddingVertical: normalize(10),
  },
  tagRemoveButton: {
    paddingRight: normalize(12),
    paddingLeft: normalize(4),
    paddingVertical: normalize(10),
  },
  tagRemoveText: {
    fontSize: normalize(12),
    color: COLORS.placeholder,
  },
  tagText: {
    fontSize: normalize(14),
    color: COLORS.primary,
    fontWeight: '500',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  popularTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  popularText: {
    fontSize: normalize(16),
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  popularSubText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },
  popularArrow: {
    fontSize: normalize(20),
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  emptyHintText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingVertical: normalize(20),
  },
  inlineLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(20),
    gap: normalize(8),
  },
  inlineNoResultContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  noResultIconSmall: {
    fontSize: normalize(24),
    marginBottom: normalize(8),
    opacity: 0.5,
  },

  noResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: normalize(60),
  },
  noResultIcon: {
    fontSize: normalize(48),
    marginBottom: normalize(16),
    opacity: 0.5,
  },
  noResultTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  noResultSubtitle: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },

  destinationScrollContainer: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  destinationSectionContainer: {
    marginTop: normalize(4),
  },
  destinationListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  destinationItemLast: {
    borderBottomWidth: 0,
  },
  destinationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  destinationName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: COLORS.text,
  },
  destinationArrow: {
    fontSize: normalize(22),
    color: COLORS.border,
    marginLeft: normalize(8),
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.placeholder,
    marginTop: normalize(40),
    fontSize: normalize(16),
  },
});
