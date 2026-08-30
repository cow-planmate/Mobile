import { StyleSheet } from 'react-native';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  primaryLight: tokens.colors.sub, 
  white: tokens.colors.white,
  text: tokens.colors.text,
  subtext: tokens.colors.textSecondary,
  subtextMuted: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  danger: '#EF4444',
  weekendBlue: '#2563EB',
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  // 고른 범위와 30일 경고가 들어가는 자리. 헤더는 세 시트가 동일해야 하므로 밖으로 뺐다.
  rangeLabel: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(6),
    fontSize: normalize(12.5),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  rangeLabelEmpty: {
    color: COLORS.placeholder,
  },
  rangeLabelNotice: {
    color: COLORS.danger,
  },

  calendarContainer: {
    width: '100%',
    paddingHorizontal: normalize(16),
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(10),
  },
  monthNavButton: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: normalize(15),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: normalize(8),
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(4),
  },
  weekDayText: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.placeholder,
  },
  daysGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', 
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  rangeBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: normalize(32),
    marginTop: -normalize(16),
    backgroundColor: COLORS.primaryLight,
  },
  rangeBgStart: {
    left: '50%', 
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeBgEnd: {
    right: '50%', 
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  dayCircle: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dayCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: COLORS.text,
  },
  dayTextSelected: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  dayTextToday: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  dayTextOutside: {
    color: COLORS.subtextMuted,
  },

  dayTextPast: {
    color: COLORS.placeholder,
  },

});
