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
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA', // PNG처럼 연한 회색 배경
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  scrollContainer: {
    paddingTop: normalize(20),
    paddingBottom: normalize(40),
    paddingHorizontal: normalize(20),
  },

  /* ── Page Title ── */
  pageHeader: {
    marginBottom: normalize(24),
  },
  pageTitle: {
    fontSize: normalize(28),
    fontFamily: FONTS.bold,
    color: '#111827',
  },

  /* ── Profile Info Area (No Card) ── */
  profileInfoArea: {
    paddingVertical: normalize(32),
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  avatarWrap: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
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
    fontSize: normalize(24),
    fontFamily: FONTS.bold,
    color: '#111827',
  },
  editIcon: {
    marginLeft: normalize(4),
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    // 그림자 제거 또는 매우 약하게 (PNG 기준)
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#111827',
  },
  changeText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  cardContent: {
    marginLeft: 30, // 아이콘 너비만큼 들여쓰기
  },
  cardValue: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },

  /* ── Theme Section specific ── */
  themeCategory: {
    marginTop: 16,
  },
  themeCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  themeCategoryTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#374151',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F1FF',
    borderWidth: 1,
    borderColor: '#D0E1FF',
  },
  tagText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },

  /* ── Footer ── */
  resignButton: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  resignText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#EF4444',
  },

  /* ── Danger Zone ── */
  dangerSection: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dangerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  dangerTextRed: {
    color: COLORS.error,
  },
});
