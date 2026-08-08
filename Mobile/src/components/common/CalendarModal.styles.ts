import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  primaryLight: '#E8EDFF', // 범위 연결 영역 배경
  white: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  subtext: '#4B5563',
  subtextMuted: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(24),
    paddingBottom: normalize(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: normalize(20),
    paddingHorizontal: normalize(8),
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: normalize(4),
  },
  headerTextArea: {
    flex: 1,
    marginRight: normalize(8),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerSubtitleNotice: {
    color: COLORS.danger,
  },
  closeButtonContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /* ── Custom Calendar Styles ── */
  calendarContainer: {
    width: '100%',
    paddingHorizontal: normalize(4),
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(8),
  },
  monthNavButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    fontWeight: '700',
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
    width: '14.28%', // 7열로 정확히 배분
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  /* 범위 선택 시 물결 모양의 백그라운드 */
  rangeBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '15%',
    bottom: '15%',
    backgroundColor: COLORS.primaryLight,
  },
  rangeBgStart: {
    left: '50%', // 시작일은 오른쪽 절반만 배경 칠함
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeBgEnd: {
    right: '50%', // 종료일은 왼쪽 절반만 배경 칠함
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
  /**
   * 인접 월의 날짜. 눌러서 그 달로 이동할 수 있는 살아 있는 컨트롤이므로
   * 읽히는 밝기를 유지한다(#6B7280, 흰 배경 대비 4.83:1).
   */
  dayTextOutside: {
    color: COLORS.subtextMuted,
  },
  /** 지난 날짜. 누를 수 없으므로 흐리게 두고 대비 기준에서 제외한다. */
  dayTextPast: {
    color: COLORS.placeholder,
  },
  
  confirmFooter: {
    width: '100%',
    marginTop: normalize(16),
  },
  confirmButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmButtonMuted: {
    opacity: 0.55,
  },
  confirmButtonText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.white,
  },
});
