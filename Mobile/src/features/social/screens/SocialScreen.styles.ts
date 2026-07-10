import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topActionHeader: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    paddingBottom: normalize(40),
  },

  /* ── Dashboard Header ── */
  dashboardHeader: {
    paddingHorizontal: normalize(16),
    marginBottom: normalize(20),
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginBottom: normalize(8),
  },
  socialBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
  },
  socialBadgeText: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    color: '#2563EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(12),
  },
  dashboardTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: normalize(4),
  },
  dashboardSubtitle: {
    fontSize: normalize(12),
    color: '#6B7280',
    lineHeight: normalize(16),
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1344FF',
    paddingHorizontal: normalize(12),
    height: normalize(38),
    borderRadius: normalize(10),
  },
  addFriendButtonText: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  /* ── Stats Grid ── */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: normalize(12),
    marginBottom: normalize(16),
  },
  statCard: {
    width: '45%',
    flexGrow: 1,
    margin: '2.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(12),
  },
  statLabel: {
    fontSize: normalize(12),
    color: '#6B7280',
    marginBottom: normalize(4),
  },
  statValue: {
    fontSize: normalize(20),
    fontWeight: '800',
    color: '#111827',
  },

  /* ── Section Cards ── */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(16),
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(16),
  },
  cardTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: normalize(2),
  },
  cardSubtitle: {
    fontSize: normalize(11),
    color: '#9CA3AF',
  },
  headerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLinkText: {
    fontSize: normalize(12),
    color: '#2563EB',
    fontWeight: 'bold',
  },

  /* ── Search Container ── */
  friendSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(12),
    height: normalize(38),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: normalize(16),
  },
  friendSearchInput: {
    flex: 1,
    fontSize: normalize(12),
    color: '#111827',
    padding: 0,
  },

  /* ── Lists ── */
  listContainer: {
    gap: normalize(14),
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: '#E5E7EB',
  },
  friendName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: normalize(12),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  actionIconButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Chat List ── */
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
    marginLeft: normalize(12),
    justifyContent: 'center',
  },
  chatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  chatName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#111827',
  },
  chatTime: {
    fontSize: normalize(11),
    color: '#9CA3AF',
  },
  chatMessage: {
    fontSize: normalize(12),
    color: '#6B7280',
    flex: 1,
    paddingRight: normalize(8),
  },
  unreadBadge: {
    backgroundColor: '#1344FF',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: normalize(9),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: normalize(12),
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: normalize(16),
  },
});
