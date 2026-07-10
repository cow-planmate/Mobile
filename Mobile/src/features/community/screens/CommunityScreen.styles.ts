import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  white: '#FFFFFF',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* ── Web Tab Bar Styles ── */
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    width: '100%',
  },
  tabBarScroll: {
    paddingHorizontal: normalize(16),
  },
  tabBarItem: {
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(12),
    marginRight: normalize(8),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBarItemActive: {
    borderBottomColor: '#1344FF',
  },
  tabBarText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#6B7280',
  },
  tabBarTextActive: {
    color: '#1344FF',
  },

  /* ── Search & Write Button Row ── */
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    gap: normalize(8),
    backgroundColor: '#F8F9FA',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(14),
    height: normalize(40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: normalize(13),
    color: '#111827',
    padding: 0,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1344FF',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(14),
    height: normalize(40),
    justifyContent: 'center',
  },
  writeButtonText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  /* ── HOT Posts Section Styles ── */
  listHeaderContainer: {
    backgroundColor: '#F8F9FA',
  },
  hotSectionContainer: {
    paddingTop: normalize(10),
    paddingBottom: normalize(16),
  },
  hotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    marginBottom: normalize(12),
  },
  hotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  hotIconWrap: {
    backgroundColor: '#FEF2F2',
    borderRadius: normalize(8),
    padding: normalize(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#111827',
  },
  hotSubtitle: {
    fontSize: normalize(10),
    color: '#9CA3AF',
    marginTop: normalize(1),
  },
  hotAllLink: {
    fontSize: normalize(12),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  hotListScroll: {
    paddingLeft: normalize(16),
    gap: normalize(12),
    paddingRight: normalize(16),
  },
  hotPostCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: normalize(16),
    width: normalize(290),
    padding: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  hotCardLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hotRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  hotRankNum: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#EF4444',
    fontStyle: 'italic',
    marginRight: normalize(4),
  },
  hotBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 0.5,
    borderRadius: normalize(4),
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(1),
    marginRight: normalize(8),
  },
  hotBadgeText: {
    fontSize: normalize(8),
    fontWeight: 'bold',
    color: '#EF4444',
  },
  hotViewsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotViewsText: {
    fontSize: normalize(10),
    color: '#9CA3AF',
  },
  hotCardTitle: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: normalize(8),
  },
  hotCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotCardAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  hotAvatar: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotAvatarText: {
    fontSize: normalize(9),
    fontWeight: 'bold',
    color: '#4B5563',
  },
  hotAuthorText: {
    fontSize: normalize(11),
    color: '#4B5563',
  },
  hotLikesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(6),
  },
  hotLikesText: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    color: '#EF4444',
  },
  hotCardRight: {
    marginLeft: normalize(10),
  },
  hotThumbnail: {
    width: normalize(68),
    height: normalize(68),
    borderRadius: normalize(10),
  },
  hotThumbnailPlaceholder: {
    width: normalize(68),
    height: normalize(68),
    borderRadius: normalize(10),
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Regular Post List Styles ── */
  postList: {
    paddingBottom: normalize(32),
  },
  postCard: {
    flexDirection: 'row',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    marginHorizontal: normalize(16),
    marginTop: normalize(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  postLeftSection: {
    flex: 1,
    paddingRight: normalize(12),
    justifyContent: 'space-between',
  },
  postTitle: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: normalize(4),
  },
  postContent: {
    fontSize: normalize(12),
    color: '#6B7280',
    lineHeight: normalize(17),
    marginBottom: normalize(8),
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: normalize(12),
    color: '#4B5563',
    fontWeight: '500',
    marginRight: normalize(4),
  },
  levelBadge: {
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(1),
    borderRadius: normalize(4),
    marginRight: normalize(6),
  },
  levelBadgeText: {
    fontSize: normalize(9),
    fontWeight: 'bold',
  },
  metaDivider: {
    fontSize: normalize(11),
    color: '#D1D5DB',
    marginHorizontal: normalize(6),
  },
  postTime: {
    fontSize: normalize(11),
    color: '#9CA3AF',
  },
  postRightSection: {
    width: normalize(76),
    alignItems: 'center',
  },
  thumbnailImage: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(12),
    marginBottom: normalize(4),
  },
  thumbnailPlaceholder: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(12),
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(4),
  },
  imagePlaceholderSymbol: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(4),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  postStatsOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(2),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: normalize(10),
    color: '#6B7280',
  },

  /* ── Pagination Styles ── */
  listFooterPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(20),
    gap: normalize(8),
  },
  pageButton: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#1344FF',
    borderColor: '#1344FF',
  },
  pageText: {
    fontSize: normalize(12),
    color: '#6B7280',
    fontWeight: '500',
  },
  pageTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pageEllipsis: {
    fontSize: normalize(12),
    color: '#9CA3AF',
    marginHorizontal: normalize(4),
  },
});
