export const theme = {
  colors: {
    primary: '#1344FF', // Requested Primary Color
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',

    // Backgrounds
    background: '#FFFFFF', // Clean White
    surface: '#FAFAFA',

    // Text
    text: '#111111',
    textSecondary: '#888888',
    textTertiary: '#BDBDBD',

    // Borders & Dividers
    border: '#F0F0F0',
    divider: '#F5F5F5',

    white: '#FFFFFF',
    disabled: '#E5E5E5',
    disabledText: '#AAAAAA',
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
    s: 4,
    m: 8,
    l: 16,
    xl: 20, // Max 20px
    round: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    weight: {
      thin: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
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
      elevation: 0,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};
