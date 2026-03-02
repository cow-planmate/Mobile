import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  surface: '#F9FAFB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const HOUR_HEIGHT = 180;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const MIN_ITEM_HEIGHT = 45;
export const GRID_SNAP_HEIGHT = HOUR_HEIGHT / 4;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  headerInput: {
    fontSize: 17,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.placeholder,
    padding: 0,
    minWidth: 150,
  },
  headerDoneButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  headerDoneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  dayTabsWrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dayTabsScroll: {
    flex: 1,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  dayTabDateText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  dayTabDateTextSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  dayTabMetaText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
    fontSize: 10,
    marginTop: 2,
  },
  dayTabMetaTextSelected: {
    color: COLORS.white,
    opacity: 0.7,
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timelineContentContainer: {
    paddingBottom: 20,
  },
  timelineWrapper: {
    position: 'relative',
    paddingVertical: 20,
  },
  gridContainer: {
    paddingVertical: 20,
  },
  hourBlock: {
    flexDirection: 'row',
  },
  hourLabelContainer: {
    width: 60,
    height: HOUR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  timeLabelText: {
    position: 'absolute',
    marginTop: -8,
    color: COLORS.placeholder,
    fontSize: 12,
    fontFamily: FONTS.medium,
    width: '100%',
    textAlign: 'center',
  },
  minuteLabel: {},
  hourContent: {
    flex: 1,
    marginLeft: 0,
    height: HOUR_HEIGHT,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingLeft: 60,
  },
  quarterBlock: {
    height: HOUR_HEIGHT / 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.border,
  },
  addPlaceListContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.card,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    padding: 10,
  },
  searchButtonIcon: {
    fontSize: 20,
  },
  placeTypeTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: COLORS.card,
  },
  placeTypeTab: {
    marginRight: 15,
    paddingVertical: 10,
  },
  placeTypeTabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  placeTypeTabText: {
    fontSize: 16,
    color: COLORS.placeholder,
    fontFamily: FONTS.semibold,
  },
  placeTypeTabTextSelected: {
    color: COLORS.primary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.placeholder,
  },
  resultName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  resultMeta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  resultAddress: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 2,
  },

  resizeHandleTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  resizeHandleBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  resizeHandleIndicator: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 10,
  },
  timeLabelTop: {
    top: 0,
  },
  flex1: {
    flex: 1,
  },
  marginTop20: {
    marginTop: 20,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },

  // Online Users Styles
  onlineUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineUsersWrapper: {
    flexDirection: 'row',
    marginRight: 10,
  },
  onlineUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  moreUsersAvatar: {
    backgroundColor: COLORS.placeholder,
  },
  onlineUserInitials: {
    color: 'white',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  moreUsersText: {
    color: 'white',
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
});
