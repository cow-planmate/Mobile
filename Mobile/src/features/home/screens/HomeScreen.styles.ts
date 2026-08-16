import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  heroSection: {
    width: '100%',
    height: normalize(180),
    backgroundColor: '#E5E7EB',
    justifyContent: 'flex-end', 
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(24), 
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroTitle: {
    fontSize: normalize(28),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: normalize(38),
    textAlign: 'left', 
  },

  actionContainer: {
    backgroundColor: 'transparent',
    marginTop: normalize(16), 
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(40),
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: normalize(20),

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  inputRow: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 0,
    paddingVertical: normalize(10),
    marginBottom: normalize(16),
  },
  inputRowLast: {
    marginBottom: normalize(8),
  },

  label: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: '#4B5563',
    marginBottom: normalize(4),
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: FONTS.medium,
    color: '#111827',
  },
  placeholderText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  rowIcon: {
    marginLeft: normalize(8),
  },
  submitButton: {
    backgroundColor: '#0047FF',
    height: normalize(50),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(24),
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
