import { Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Standardize sizes based on a 360px wide screen (standard for many Android/iOS device designs).
 */
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));
