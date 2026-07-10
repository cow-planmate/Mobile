import { StyleSheet, Platform } from 'react-native';
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
    backgroundColor: '#F8F9FA',
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

  /* ── New Web Style Profile ── */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(20),
    marginHorizontal: normalize(16),
    marginTop: normalize(16),
    borderWidth: 1,
    borderColor: '#EAECEF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: normalize(16),
  },
  avatarImage: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(38),
    borderWidth: 2,
    borderColor: '#1344FF',
  },
  avatarPlaceholder: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(38),
    borderWidth: 2,
    borderColor: '#1344FF',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1344FF',
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: normalize(4),
    gap: normalize(6),
  },
  nicknameText: {
    fontSize: normalize(22),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: '#111827',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1344FF',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(12),
    gap: normalize(3),
  },
  levelBadgeText: {
    fontSize: normalize(10),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emailText: {
    fontSize: normalize(12),
    color: '#6B7280',
  },
  emailDivider: {
    fontSize: normalize(12),
    color: '#D1D5DB',
    marginHorizontal: normalize(6),
  },
  genderAgeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },
  genderAgeBadgeText: {
    fontSize: normalize(10),
    color: '#4B5563',
    fontWeight: '500',
  },
  experienceSection: {
    marginBottom: normalize(16),
  },
  experienceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  experienceTitle: {
    fontSize: normalize(12),
    color: '#1344FF',
    fontWeight: 'bold',
  },
  experienceValue: {
    fontSize: normalize(11),
    color: '#9CA3AF',
  },
  progressBarTrack: {
    height: normalize(6),
    backgroundColor: '#E5E7EB',
    borderRadius: normalize(3),
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1344FF',
    borderRadius: normalize(3),
  },
  tagSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginBottom: normalize(20),
  },
  interestTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  interestTagText: {
    fontSize: normalize(11),
    color: '#4B5563',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: normalize(16),
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: normalize(20),
    color: '#1344FF',
    fontWeight: 'bold',
    marginBottom: normalize(2),
  },
  statLabel: {
    fontSize: normalize(11),
    color: '#6B7280',
  },

  /* ── Achievements Area ── */
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    padding: normalize(20),
    marginHorizontal: normalize(16),
    marginTop: normalize(16),
    borderWidth: 1,
    borderColor: '#EAECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  achievementTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#111827',
  },
  achievementProgressBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(12),
  },
  achievementProgressText: {
    fontSize: normalize(10),
    color: '#1A73E8',
    fontWeight: 'bold',
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    gap: normalize(4),
  },
  badgeText: {
    fontSize: normalize(11),
    fontWeight: 'bold',
  },

  /* ── Settings Modal Menu ── */
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  settingsDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  settingsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    padding: normalize(24),
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  settingsTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsCloseButton: {
    padding: normalize(4),
  },
  settingsList: {
    gap: normalize(4),
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  settingsItemText: {
    fontSize: normalize(14),
    color: '#374151',
    fontWeight: '500',
  },
  settingsItemDangerText: {
    fontSize: normalize(14),
    color: '#EF4444',
    fontWeight: '600',
  },
});
