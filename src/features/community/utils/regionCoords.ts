export interface RegionCoord {
  lat: number;
  lng: number;
}

/**
 * 여행지 지도 마커 좌표. 웹(feed/utils/region.ts)의 REGION_COORDINATES와 같은 기준으로
 * 광역자치단체 + 게시글이 많은 시·군을 담는다. 여기에 없는 지역은 지도에 표시하지 않는다.
 */
export const REGION_COORDINATES: Record<string, RegionCoord> = {
  서울: { lat: 37.5665, lng: 126.978 },
  부산: { lat: 35.1796, lng: 129.0756 },
  대구: { lat: 35.8714, lng: 128.6014 },
  인천: { lat: 37.4563, lng: 126.7052 },
  광주: { lat: 35.1595, lng: 126.8526 },
  대전: { lat: 36.3504, lng: 127.3845 },
  울산: { lat: 35.5384, lng: 129.3114 },
  세종: { lat: 36.48, lng: 127.289 },
  경기: { lat: 37.4138, lng: 127.5183 },
  강원: { lat: 37.8228, lng: 128.1555 },
  충북: { lat: 36.8, lng: 127.7 },
  충남: { lat: 36.5184, lng: 126.8 },
  전북: { lat: 35.7175, lng: 127.153 },
  전남: { lat: 34.8679, lng: 126.991 },
  경북: { lat: 36.4919, lng: 128.8889 },
  경남: { lat: 35.4606, lng: 128.2132 },
  제주: { lat: 33.4996, lng: 126.5312 },
  제주도: { lat: 33.4996, lng: 126.5312 },
  강릉: { lat: 37.7518, lng: 128.8761 },
  속초: { lat: 38.207, lng: 128.5918 },
  춘천: { lat: 37.8813, lng: 127.7298 },
  경주: { lat: 35.8562, lng: 129.2247 },
  전주: { lat: 35.8242, lng: 127.148 },
  여수: { lat: 34.7604, lng: 127.6622 },
  통영: { lat: 34.8544, lng: 128.4331 },
  가평: { lat: 37.8315, lng: 127.5095 },
  서귀포: { lat: 33.2541, lng: 126.56 },
};

export const getRegionCoords = (region: string): RegionCoord | undefined =>
  REGION_COORDINATES[region?.trim()];
