import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  lightBlue: '#e6f0ff',
  shadow: '#1344FF',
  iconBg: '#F5F7FF',
  success: '#34C759',
  placeholderLight: '#C7C7CC',
  error: '#FF3B30',
  errorLight: '#FFE5E5',
  disabled: '#A8B5D1',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: normalize(30),
    paddingBottom: 0,
  },
  headerTopArea: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(24),
    marginTop: normalize(10),
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  whiteSection: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(32),
    borderTopRightRadius: normalize(32),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(32),
    paddingBottom: normalize(40),
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 500,
  },
  section: {
    marginBottom: normalize(32),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(16),
    color: COLORS.text,
  },
  planItem: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    padding: normalize(20),
    marginBottom: normalize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
    marginTop: normalize(4),
  },
  moreButton: {
    width: normalize(28),
    height: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: normalize(6),
    marginLeft: normalize(8),
  },
  planTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  planDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  icon: {
    fontSize: normalize(16),
    marginRight: normalize(8),
    width: normalize(20),
    textAlign: 'center',
  },
  planDate: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  planLocation: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(40),
    backgroundColor: COLORS.lightGray,
    borderRadius: normalize(20),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.placeholderLight,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.darkGray,
    fontSize: normalize(14),
    marginTop: normalize(8),
  },
  emptyIcon: {
    fontSize: normalize(32),
    marginBottom: normalize(8),
    color: COLORS.disabled,
  },
});
