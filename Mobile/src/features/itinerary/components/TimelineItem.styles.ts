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
  0: {
    border: '#84cc16',
    bg: '#f7fee7',
    textMain: '#064e3b',
    textSub: '#4d7c0f',
  }, // 관광지 (Lime)
  1: {
    border: '#f97316',
    bg: '#fff7ed',
    textMain: '#7c2d12',
    textSub: '#c2410c',
  }, // 숙소 (Orange)
  2: {
    border: '#3b82f6',
    bg: '#eff6ff',
    textMain: '#1e3a8a',
    textSub: '#1d4ed8',
  }, // 식당 (Blue)
  3: {
    border: '#8b5cf6',
    bg: '#f5f3ff',
    textMain: '#4c1d95',
    textSub: '#6d28d9',
  }, // 직접 추가 (Violet)
  4: {
    border: '#6b7280',
    bg: '#f9fafb',
    textMain: '#111827',
    textSub: '#4b5563',
  }, // 검색/기타 (Gray)
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
    borderRadius: 4,
    padding: 16,
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderWidth: 0,
  },
  cardCompact: {
    paddingVertical: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
    gap: 2,
  },
  nameText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#064e3b', // default for lime-900 like
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#4d7c0f', // default for lime-600 like
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
