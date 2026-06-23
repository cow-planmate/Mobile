import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(48) : normalize(16),
    paddingBottom: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(16),
  },
  iconButton: {
    padding: normalize(4),
  },
  searchContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: normalize(10),
    paddingHorizontal: normalize(12),
    height: normalize(40),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: normalize(8),
    fontSize: normalize(14),
    color: COLORS.text,
    padding: 0,
  },
  categoryScroll: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    maxHeight: normalize(56),
  },
  categoryChip: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: COLORS.surface,
    marginRight: normalize(8),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  postList: {
    paddingBottom: normalize(80),
  },
  postCard: {
    backgroundColor: COLORS.background,
    padding: normalize(16),
    marginHorizontal: normalize(16),
    marginVertical: normalize(8),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  authorAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: COLORS.sub,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(8),
  },
  authorAvatarText: {
    color: COLORS.primary,
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    fontWeight: '600',
  },
  postTime: {
    fontSize: normalize(11),
    color: COLORS.textTertiary,
    marginTop: normalize(1),
  },
  postTag: {
    backgroundColor: COLORS.sub,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(4),
  },
  postTagText: {
    fontSize: normalize(10),
    color: COLORS.primary,
    fontWeight: '600',
  },
  postBody: {
    marginBottom: normalize(12),
  },
  postTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: normalize(6),
  },
  postContent: {
    fontSize: normalize(13),
    fontFamily: FONTS.regular,
    color: COLORS.textLabel,
    lineHeight: normalize(18),
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: normalize(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: normalize(10),
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  footerText: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },
  floatingButton: {
    position: 'absolute',
    bottom: normalize(20),
    right: normalize(20),
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(26),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
