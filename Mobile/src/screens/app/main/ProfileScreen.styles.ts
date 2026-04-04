import { StyleSheet, Platform, PixelRatio, Dimensions } from 'react-native';
import { normalize } from '../../../utils/normalize';

export const COLORS = {
  primary: '#1344FF',
  sub: '#E8EDFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  error: '#EF4444',
  surface: '#F9FAFB',
};

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: normalize(40),
  },

  /* ── Profile Info Area (PNG Style) ── */
  profileInfoArea: {
    paddingTop: normalize(32),
    paddingBottom: normalize(32),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  avatarWrap: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: normalize(16),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  nicknameText: {
    fontSize: normalize(26),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: '#1F2937',
  },
  editIcon: {
    marginLeft: normalize(4),
  },

  /* ── Section Cards (PNG Style) ── */
  contentArea: {
    padding: normalize(20),
    backgroundColor: '#FFFFFF',
    gap: normalize(16),
  },
  sectionWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    marginHorizontal: normalize(16),
    marginTop: normalize(16),
    borderWidth: 1,
    borderColor: '#EAECEF',
    overflow: 'hidden',
    marginBottom: normalize(20),
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    padding: normalize(12),
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: '#EAECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  cardTitle: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#1F2937',
  },
  changeText: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  cardContent: {
    marginTop: normalize(8),
    paddingLeft: normalize(30),
  },
  cardValue: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },

  /* ── Theme Section specific ── */
  themeCategory: {
    marginTop: normalize(12),
  },
  themeCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(8),
  },
  themeCategoryTitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.semibold,
    color: '#4B5563',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
    paddingLeft: normalize(24),
  },
  tag: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: normalize(10),
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#E0EEFF',
  },
  tagText: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: '#2563EB',
  },

  /* ── Footer ── */
  footerArea: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(30),
    gap: normalize(12),
  },
  logoutButton: {
    alignSelf: 'flex-start',
    paddingVertical: normalize(4),
  },
  logoutText: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  resignButton: {
    alignSelf: 'flex-start',
    paddingVertical: normalize(4),
  },
  resignText: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
  },
});
