import axios from 'axios';

/**
 * 장소 상세.
 *
 * 웹 PlaceDetailModal이 읽는 것과 같은 자리를 그대로 읽는다 - 같은 서버가 주는
 * 같은 것을 두 앱이 다르게 그리면 어느 쪽이 맞는지 알 수 없다. 갈래에 따라
 * 오는 묶음이 달라지고, 그 안에서도 있는 것만 온다.
 */
export interface PlaceDetailImage {
  originUrl?: string | null;
  smallUrl?: string | null;
}

export interface PlaceDetailInfoItem {
  name?: string | null;
  text?: string | null;
}

export interface PlaceDetailRoom {
  roomTitle?: string | null;
  roomSize?: string | number | null;
  baseCount?: string | number | null;
  maxCount?: string | number | null;
}

export interface PlaceDetail {
  contentId?: string | number | null;
  title?: string | null;
  category?: string | null;
  addr1?: string | null;
  overview?: string | null;
  homepage?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  images?: PlaceDetailImage[] | null;
  attraction?: {
    useTime?: string | null;
    restDate?: string | null;
    useFee?: string | null;
    parking?: string | null;
    infoCenter?: string | null;
    infoItems?: PlaceDetailInfoItem[] | null;
  } | null;
  accommodation?: {
    checkInTime?: string | null;
    checkOutTime?: string | null;
    roomCount?: string | number | null;
    parking?: string | null;
    cooking?: string | null;
    infoCenter?: string | null;
    amenities?: (string | null)[] | null;
    rooms?: PlaceDetailRoom[] | null;
  } | null;
  restaurant?: {
    firstMenu?: string | null;
    treatMenu?: unknown;
    menus?: unknown;
    menu?: unknown;
    openTime?: string | null;
    restDate?: string | null;
    parking?: string | null;
    infoCenter?: string | null;
  } | null;
}

export async function fetchPlaceDetail(
  contentId: string,
  signal?: AbortSignal,
): Promise<PlaceDetail> {
  const { data } = await axios.get(
    `/api/place/${encodeURIComponent(contentId)}`,
    { signal },
  );
  return (data?.data ?? data ?? {}) as PlaceDetail;
}

/**
 * 못 불러왔을 때 사람 말로 옮긴다. 문구는 웹과 같게 둔다.
 *
 * 없는 것과 못 가져온 것은 다르다 - 아직 없는 곳이라고 알려 주면 기다리지 않고
 * 넘어가지만, 실패라고만 하면 몇 번이고 다시 누른다.
 */
export function getPlaceDetailErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 404) return '이 장소의 상세 정보는 아직 제공되지 않아요.';
  return '상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
}
