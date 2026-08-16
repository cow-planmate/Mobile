export const theme = {
  colors: {
    primary: '#1344FF',
    primaryDark: '#0F36D6',
    sub: '#E8EDFF', 
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',

    background: '#FFFFFF',
    surface: '#F9FAFB', 

    text: '#111827', 
    textSecondary: '#6B7280', 
    textTertiary: '#9CA3AF', 
    textLabel: '#4B5563', 

    border: '#E5E7EB', 
    borderLight: '#F3F4F6', 
    borderStrong: '#D1D5DB', 
    divider: '#F3F4F6',

    white: '#FFFFFF',
    disabled: '#E5E7EB',
    disabledText: '#9CA3AF',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    section: 48,
  },
  borderRadius: {
    xs: 4,
    s: 6,
    m: 8,
    l: 12,
    xl: 16,
    round: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'Pretendard-Regular',
      medium: 'Pretendard-Medium',
      semibold: 'Pretendard-SemiBold',
      bold: 'Pretendard-Bold',
    },
    weight: {
      thin: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    size: {
      xs: 12,
      s: 14,
      m: 16,
      l: 20,
      xl: 24,
      xxl: 32,
      display: 36,
    },
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
};
