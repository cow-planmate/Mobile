import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
};

export const HOUR_HEIGHT = 180;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const MIN_ITEM_HEIGHT = 45;
export const GRID_TOP_OFFSET = 40;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 30,
  },
  mapContainer: {
    height: '40%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  dayTabsWrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row', // Align tablist and toggle button horizontally
    alignItems: 'center',
    paddingRight: 15,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  mapToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginLeft: 5,
  },
  mapToggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    minWidth: 60,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  dayTabDateText: {
    color: COLORS.placeholder,
    fontSize: 12,
    marginTop: 2,
  },
  dayTabDateTextSelected: {
    color: COLORS.white,
    opacity: 0.8,
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
    fontWeight: '500',
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
    borderTopColor: COLORS.border,
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 5,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
  },
  timeLabelTop: {
    top: 0,
  },
  flex1: {
    flex: 1,
  },
});
