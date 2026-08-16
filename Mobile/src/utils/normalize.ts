import { Dimensions, PixelRatio } from 'react-native';

const BASE_WIDTH = 360;
const MIN_SCALE = 0.95;
const MAX_SCALE = 1.2;

export const getScaleForWidth = (width: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / BASE_WIDTH));

const scale = getScaleForWidth(Dimensions.get('window').width);

export const sf = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

export const sp = sf;
export const normalize = sf;
