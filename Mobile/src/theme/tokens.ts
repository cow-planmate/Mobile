export const colors = {
  primary: '#1344FF',
  primaryPressed: '#0D34CC',
  primaryTint: '#F0F4FF',
  primarySurface: '#EFF6FF',
  sub: '#E8EDFF',

  background: '#FFFFFF',
  surface: '#F8F9FA',
  white: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#9CA3AF',
  textLabel: '#4B5563',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderStrong: '#D1D5DB',
  disabled: '#E5E7EB',
};

export const tones = {
  neutral: { bg: '#F3F4F6', fg: '#6B7280' },
  primary: { bg: '#EFF6FF', fg: '#1344FF' },
  hot: { bg: '#FEF2F2', fg: '#DC2626' },
  success: { bg: '#F0FDF4', fg: '#15803D' },
  warning: { bg: '#FFFBEB', fg: '#B45309' },
  danger: { bg: '#FEF2F2', fg: '#DC2626' },
  place: { bg: '#ECFDF5', fg: '#047857' },
  rating: { bg: '#FEFCE8', fg: '#A16207' },
  // 사용자가 직접 적어 넣은 것. 서버가 준 갈래 넷과 섞이지 않게 따로 둔다.
  custom: { bg: '#F5F3FF', fg: '#6D28D9' },
};

// 안드로이드는 shadowColor/Offset/Opacity/Radius를 렌더링하지 않고 elevation만 읽는다.
// 그래서 그림자는 실제로 뜨는 요소(FAB, 바텀시트, 모달, 토스트)에만 md 하나로 통일해서 쓴다.
// 일반 화면 콘텐츠(패널, 목록 카드)는 배경색 대비와 1px 보더로 구분한다 — Card.tsx 참고.
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const fontSize = {
  xxs: 10,
  xs: 12,
  s: 14,
  m: 16,
  ml: 18,
  l: 20,
  xl: 24,
  xxl: 32,
};

export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const radius = {
  xs: 4,
  s: 6,
  m: 8,
  l: 12,
  xl: 16,
  round: 9999,
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const tokens = {
  colors,
  tones,
  shadows,
  fontSize,
  fontFamily,
  radius,
  spacing,
};

export type ToneName = keyof typeof tones;
