import { Dimensions, PixelRatio } from 'react-native';

/**
 * 화면 폭을 모듈 로드 시점에 한 번만 읽는다.
 *
 * 이 값에 의존하는 스타일이 대부분 모듈 스코프 StyleSheet라 어차피 한 번만
 * 계산된다. 그래서 앱을 세로로 고정해 폭이 바뀌지 않게 두고 있다
 * (AndroidManifest의 screenOrientation="portrait"). 가로를 지원하게 되면
 * 이 값과 이를 쓰는 스타일들을 함께 반응형으로 바꿔야 한다.
 */
const { width } = Dimensions.get('window');

/**
 * 360px 기준 디자인 화면에 맞추어 다양한 기기 해상도에 맞게 크기를 정규화(스케일링)합니다.
 * @param size 기준 크기 (px)
 * @returns 정규화된 픽셀 크기
 */
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

