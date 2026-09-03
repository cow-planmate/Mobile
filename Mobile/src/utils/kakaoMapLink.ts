type KakaoMapLinkSource = {
  /** 카카오 로컬 검색으로 고른 장소의 상세 페이지 주소. 직접 적어 넣은 곳은 없다. */
  placeUrl?: string | null;
  name?: string | null;
  coords?: { lat: number; lng: number } | null;
  /**
   * 검색으로 떨어질 때 쓸 말. 기본은 이름이다.
   * 이름만으로는 같은 이름의 다른 곳이 열리므로 주소를 붙여 좁힌다.
   */
  searchQuery?: string | null;
};

const isUsableCoord = (value?: number | null): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value !== 0;

/**
 * 일정에 담긴 장소를 카카오맵에서 열 주소.
 *
 * 상세 페이지 > 좌표 > 이름 검색 차례로 고른다. 셋 다 없으면 열 길이 없으므로 null이다.
 * 앱은 지도를 직접 갖고 있지 않으니 영업시간·길찾기가 필요한 순간에는 이 길로 넘긴다.
 */
export const buildKakaoMapUrl = ({
  placeUrl,
  name,
  coords,
  searchQuery,
}: KakaoMapLinkSource): string | undefined => {
  const trimmedPlaceUrl = placeUrl?.trim();
  if (trimmedPlaceUrl) return trimmedPlaceUrl;

  const trimmedName = name?.trim();
  if (coords && isUsableCoord(coords.lat) && isUsableCoord(coords.lng)) {
    // 이름이 비면 마커 이름표가 깨지므로 대신 넣을 말을 둔다.
    const label = encodeURIComponent(trimmedName || '일정 장소');
    return `https://map.kakao.com/link/map/${label},${coords.lat},${coords.lng}`;
  }

  const query = searchQuery?.trim() || trimmedName;
  return query
    ? `https://map.kakao.com/link/search/${encodeURIComponent(query)}`
    : undefined;
};
