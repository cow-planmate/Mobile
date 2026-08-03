import { Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * 360px 기준 디자인 화면에 맞추어 다양한 기기 해상도에 맞게 크기를 정규화(스케일링)합니다.
 * @param size 기준 크기 (px)
 * @returns 정규화된 픽셀 크기
 */
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

