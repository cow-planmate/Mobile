import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  card: '#FFFFFF',
  text: '#111827',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  error: '#FF3B30',
  surface: '#F3F4F6',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const CATEGORY_COLORS = {
  0: { border: '#84cc16', bg: '#f7fee7' }, // 관광지 (Lime)
  1: { border: '#f97316', bg: '#fff7ed' }, // 숙소 (Orange)
  2: { border: '#3b82f6', bg: '#eff6ff' }, // 식당 (Blue)
  3: { border: '#8b5cf6', bg: '#f5f3ff' }, // 직접 추가 (Violet)
  4: { border: '#6b7280', bg: '#f9fafb' }, // 검색/기타 (Gray)
};

export const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 0,
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONTS.medium,
  },
  timeTextEditable: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    textDecorationLine: 'underline',
  },
  nameText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  memoText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: FONTS.regular,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 18,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
});
