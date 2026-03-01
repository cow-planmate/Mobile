export const theme = {
  colors: {
    primary: '#1344FF',
    primaryDark: '#0F36D6',
    sub: '#E8EDFF', // Light primary tint (backgrounds, badges)
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB', // Tailwind gray-50

    // Text
    text: '#111827', // Tailwind gray-900
    textSecondary: '#6B7280', // Tailwind gray-500
    textTertiary: '#9CA3AF', // Tailwind gray-400
    textLabel: '#4B5563', // Tailwind gray-600

    // Borders & Dividers
    border: '#E5E7EB', // Tailwind gray-200 — primary border
    borderLight: '#F3F4F6', // Tailwind gray-100 — subtle dividers
    borderStrong: '#D1D5DB', // Tailwind gray-300 — input borders
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
      regular: 'System',
      medium: 'System',
      bold: 'System',
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
  // No shadows — use borders for depth
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
