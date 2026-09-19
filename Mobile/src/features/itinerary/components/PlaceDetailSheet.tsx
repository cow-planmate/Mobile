import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BedDouble from 'lucide-react-native/dist/esm/icons/bed-double';
import CalendarDays from 'lucide-react-native/dist/esm/icons/calendar-days';
import Car from 'lucide-react-native/dist/esm/icons/car';
import Clock3 from 'lucide-react-native/dist/esm/icons/clock-3';
import Phone from 'lucide-react-native/dist/esm/icons/phone';
import UtensilsCrossed from 'lucide-react-native/dist/esm/icons/utensils-crossed';
import WalletCards from 'lucide-react-native/dist/esm/icons/wallet-cards';
import ExternalLink from 'lucide-react-native/dist/esm/icons/external-link';
import ImageOff from 'lucide-react-native/dist/esm/icons/image-off';
import Info from 'lucide-react-native/dist/esm/icons/info';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import SheetModal from '../../../components/common/SheetModal';
import {
  fetchPlaceDetail,
  formatCopyrightLabel,
  getPlaceDetailErrorMessage,
  type PlaceDetail,
} from '../../../api/place';
import { normalize } from '../../../utils/normalize';
import { styles, COLORS } from './PlaceDetailSheet.styles';

const CATEGORY_LABEL: Record<string, string> = {
  ATTRACTION: '관광지',
  ACCOMMODATION: '숙소',
  RESTAURANT: '식당',
};

/** 소개를 접어 둘 줄 수. 전문이 일곱 문장씩 오는 곳이 많아 그대로 펴면 아래가 밀린다. */
const OVERVIEW_LINES = 3;

/** Tour API 원문에 섞여 오는 태그와 겹친 공백을 걷어 낸다. 웹 cleanText와 같다. */
const cleanText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 메뉴가 원문·배열·{name/price} 객체 아무 꼴로 와도 한 목록으로 편다.
 *
 * 웹 normalizeMenus를 그대로 옮긴다 - 같은 서버가 주는 같은 것을 두 앱이 다르게
 * 읽으면 한쪽에만 메뉴가 뜬다.
 */
const normalizeMenus = (value: unknown): string[] => {
  const collected: string[] = [];
  const visit = (item: unknown) => {
    if (item == null) return;
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (typeof item === 'object') {
      const row = item as Record<string, unknown>;
      const name = cleanText(row.name ?? row.title ?? row.menuName ?? row.menu);
      const price = cleanText(row.price ?? row.menuPrice ?? row.cost);
      if (name) collected.push(price ? `${name} · ${price}` : name);
      else Object.values(row).forEach(visit);
      return;
    }
    cleanText(item)
      .split(/\r?\n|\s*[|·ㆍ]\s*|\s*,\s*/)
      .map(menu => menu.replace(/^[-–•]\s*/, '').trim())
      .filter(Boolean)
      .forEach(menu => collected.push(menu));
  };
  visit(value);
  return [...new Set(collected)];
};

const httpsUrl = (url: string) => url.replace(/^http:\/\//i, 'https://');

/**
 * 상세를 열 때 넘기는 것.
 *
 * 여는 자리마다 지도와 담기가 되는지가 달라, 할 수 있는 일을 부르는 쪽이
 * 함께 넘긴다 - 시트는 무엇을 보여 줄지만 안다.
 */
export interface PlaceDetailTarget {
  contentId: string;
  name?: string | null;
  address?: string | null;
  onOpenMap?: () => void;
  onAdd?: () => void;
}

interface PlaceDetailSheetProps {
  visible: boolean;
  /** 상세를 받아 올 열쇠. 없으면 아무것도 부르지 않는다. */
  contentId: string | null;
  /** 아직 못 받았을 때 대신 보여 줄 것. 목록에 이미 있는 이름과 주소다. */
  fallbackName?: string | null;
  fallbackAddress?: string | null;
  onClose: () => void;
  /** 지도에서 보기. 위치를 모르는 자리에서는 주지 않는다. */
  onOpenMap?: () => void;
  /** 읽다가 그 자리에서 담는 길. 이미 시간표에 있는 장소에는 주지 않는다. */
  onAdd?: () => void;
}

interface InfoRow {
  label: string;
  value: string;
}

/** 줄마다 다른 그림. 시계만 늘어놓으면 요금도 문의도 시간처럼 읽힌다. */
const INFO_ICON: Record<string, typeof Clock3> = {
  '이용 시간': Clock3,
  '영업 시간': Clock3,
  체크인: Clock3,
  체크아웃: Clock3,
  '쉬는 날': CalendarDays,
  '이용 요금': WalletCards,
  '객실 수': BedDouble,
  주차: Car,
  취사: UtensilsCrossed,
  문의: Phone,
};

/**
 * 장소 상세.
 *
 * 웹 PlaceDetailModal과 같은 것을 보여 주되 좁은 폭에 맞춘다 - 소개는 접어 두고,
 * 이용 정보는 한 줄씩 쌓고, 사진은 화살표 대신 손가락으로 넘긴다. 읽다가 바로
 * 담을 수 있게 담기 단추를 밑줄에 붙박는다.
 */
export default function PlaceDetailSheet({
  visible,
  contentId,
  fallbackName,
  fallbackAddress,
  onClose,
  onOpenMap,
  onAdd,
}: PlaceDetailSheetProps) {
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOverviewOpen, setOverviewOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!visible || !contentId) return;

    const controller = new AbortController();
    setDetail(null);
    setError('');
    setOverviewOpen(false);
    setPhotoIndex(0);
    setLoading(true);
    fetchPlaceDetail(contentId, controller.signal)
      .then(setDetail)
      .catch(requestError => {
        if (controller.signal.aborted) return;
        setError(getPlaceDetailErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [visible, contentId]);

  const photos = useMemo(() => {
    if (!detail) return [];
    const candidates = [
      ...(detail.images ?? []).flatMap(image => [
        image?.originUrl,
        image?.smallUrl,
      ]),
      detail.imageUrl,
      detail.thumbnailUrl,
    ];
    return [
      ...new Set(candidates.filter(Boolean).map(url => httpsUrl(String(url)))),
    ];
  }, [detail]);

  const menus = useMemo(
    () =>
      normalizeMenus(
        detail?.restaurant?.treatMenu ??
          detail?.restaurant?.menus ??
          detail?.restaurant?.menu,
      ),
    [detail],
  );

  const infoRows = useMemo<InfoRow[]>(() => {
    if (!detail) return [];
    const pick = (label: string, value: unknown): InfoRow[] => {
      const text = cleanText(value);
      return text ? [{ label, value: text }] : [];
    };
    const { attraction, accommodation, restaurant } = detail;
    if (detail.category === 'ATTRACTION') {
      return [
        ...pick('이용 시간', attraction?.useTime),
        ...pick('쉬는 날', attraction?.restDate),
        ...pick('이용 요금', attraction?.useFee),
        ...pick('주차', attraction?.parking),
        ...pick('문의', attraction?.infoCenter),
      ];
    }
    if (detail.category === 'ACCOMMODATION') {
      return [
        ...pick('체크인', accommodation?.checkInTime),
        ...pick('체크아웃', accommodation?.checkOutTime),
        ...pick('객실 수', accommodation?.roomCount),
        ...pick('주차', accommodation?.parking),
        ...pick('취사', accommodation?.cooking),
        ...pick('문의', accommodation?.infoCenter),
      ];
    }
    if (detail.category === 'RESTAURANT') {
      return [
        ...pick('영업 시간', restaurant?.openTime),
        ...pick('쉬는 날', restaurant?.restDate),
        ...pick('주차', restaurant?.parking),
        ...pick('문의', restaurant?.infoCenter),
      ];
    }
    return [];
  }, [detail]);

  const openHomepage = useCallback(() => {
    const raw = cleanText(detail?.homepage);
    const url = raw.match(/https?:\/\/\S+/)?.[0];
    if (url) void Linking.openURL(url);
  }, [detail]);

  const title = detail?.title ?? fallbackName ?? '장소 상세';
  const address = cleanText(detail?.addr1) || cleanText(fallbackAddress);
  const overview = cleanText(detail?.overview);
  const notices = (detail?.attraction?.infoItems ?? []).filter(item =>
    cleanText(item?.text),
  );
  const amenities = (detail?.accommodation?.amenities ?? []).filter(
    (amenity): amenity is string => !!cleanText(amenity),
  );
  const rooms = detail?.accommodation?.rooms ?? [];
  const photoWidth = Dimensions.get('window').width;

  return (
    <SheetModal
      visible={visible}
      title="장소 정보"
      onClose={onClose}
      maxHeightRatio={0.9}
      footer={
        onOpenMap || onAdd ? (
          <View style={styles.foot}>
            {!!onOpenMap && (
              <TouchableOpacity
                style={styles.footButton}
                onPress={onOpenMap}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="지도에서 보기"
              >
                <Text style={styles.footButtonText}>지도에서 보기</Text>
              </TouchableOpacity>
            )}
            {!!onAdd && (
              <TouchableOpacity
                style={[styles.footButton, styles.footPrimary]}
                onPress={onAdd}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="시간표에 담기"
              >
                <Text style={[styles.footButtonText, styles.footPrimaryText]}>
                  시간표에 담기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : undefined
      }
    >
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.stateText}>장소 정보를 불러오고 있어요</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Info size={normalize(28)} color={COLORS.textTertiary} />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {photos.length > 0 ? (
            <View style={styles.photoStrip}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={event =>
                  setPhotoIndex(
                    Math.round(
                      event.nativeEvent.contentOffset.x / (photoWidth || 1),
                    ),
                  )
                }
              >
                {photos.map(url => (
                  <Image
                    key={url}
                    source={{ uri: url }}
                    style={[styles.photo, { width: photoWidth }]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.photoCopyright}>
                <Text style={styles.photoCopyrightText}>
                  출처: 한국관광공사
                </Text>
              </View>
              {photos.length > 1 && (
                <View style={styles.photoCount}>
                  <Text style={styles.photoCountText}>
                    {photoIndex + 1} / {photos.length}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.photoEmpty}>
              <ImageOff size={normalize(26)} color={COLORS.textTertiary} />
              <Text style={styles.photoEmptyText}>등록된 사진이 없어요</Text>
            </View>
          )}

          <View style={styles.head}>
            {!!detail?.category && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {CATEGORY_LABEL[detail.category] ?? '장소'}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{title}</Text>
            {!!address && (
              <View style={styles.addressRow}>
                <MapPin size={normalize(13)} color={COLORS.textTertiary} />
                <Text style={styles.address}>{address}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>장소 소개</Text>
            <Text
              style={styles.overview}
              numberOfLines={isOverviewOpen ? undefined : OVERVIEW_LINES}
            >
              {overview || '등록된 소개 정보가 없어요.'}
            </Text>
            {!!overview && (
              <TouchableOpacity
                onPress={() => setOverviewOpen(open => !open)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  isOverviewOpen ? '소개 접기' : '소개 더 보기'
                }
              >
                <Text style={styles.moreText}>
                  {isOverviewOpen ? '접기' : '더 보기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {detail?.category === 'RESTAURANT' &&
            (!!cleanText(detail?.restaurant?.firstMenu) ||
              menus.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>메뉴</Text>
                {!!cleanText(detail?.restaurant?.firstMenu) && (
                  <View style={styles.menuCard}>
                    <View>
                      <Text style={styles.menuLabel}>대표 메뉴</Text>
                      <Text style={styles.menuName}>
                        {cleanText(detail?.restaurant?.firstMenu)}
                      </Text>
                    </View>
                  </View>
                )}
                {menus.length > 0 && (
                  <View style={styles.pills}>
                    {menus.map(menu => (
                      <View key={menu} style={styles.pill}>
                        <Text style={styles.pillText}>{menu}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

          {infoRows.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이용 정보</Text>
              {infoRows.map(row => {
                const Icon = INFO_ICON[row.label] ?? Clock3;
                return (
                  <View key={row.label} style={styles.infoRow}>
                    <Icon size={normalize(13)} color={COLORS.primary} />
                    <View style={styles.infoBody}>
                      <Text style={styles.infoLabel}>{row.label}</Text>
                      <Text style={styles.infoValue}>{row.value}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {notices.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>추가 안내</Text>
              {notices.map((item, index) => (
                <View
                  key={`${cleanText(item?.name)}-${index}`}
                  style={styles.noticeRow}
                >
                  <Text style={styles.noticeName}>{cleanText(item?.name)}</Text>
                  <Text style={styles.noticeText}>{cleanText(item?.text)}</Text>
                </View>
              ))}
            </View>
          )}

          {amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>편의 시설</Text>
              <View style={styles.pills}>
                {amenities.map(amenity => (
                  <View key={amenity} style={styles.pill}>
                    <Text style={styles.pillText}>{cleanText(amenity)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {rooms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>객실 안내</Text>
              {rooms.map((room, index) => (
                <View
                  key={`${cleanText(room?.roomTitle)}-${index}`}
                  style={styles.roomCard}
                >
                  <Text style={styles.roomTitle}>
                    {cleanText(room?.roomTitle) || `객실 ${index + 1}`}
                  </Text>
                  {!!cleanText(room?.roomSize) && (
                    <Text style={styles.roomMeta}>
                      {cleanText(room?.roomSize)}㎡
                    </Text>
                  )}
                  {(!!room?.baseCount || !!room?.maxCount) && (
                    <Text style={styles.roomMeta}>
                      기준 {cleanText(room?.baseCount) || '-'}명 · 최대{' '}
                      {cleanText(room?.maxCount) || '-'}명
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {!!cleanText(detail?.homepage) && (
            <TouchableOpacity
              style={styles.homepage}
              onPress={openHomepage}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="공식 홈페이지 열기"
            >
              <Text style={styles.homepageText}>공식 홈페이지</Text>
              <ExternalLink size={normalize(14)} color={COLORS.white} />
            </TouchableOpacity>
          )}

          <View style={styles.sourceNotice}>
            <Text style={styles.sourceNoticeText}>
              {`사진 및 장소 정보 제공: 한국관광공사 TourAPI${
                detail?.copyrightDivCd
                  ? ` (${formatCopyrightLabel(detail.copyrightDivCd)})`
                  : ''
              }`}
            </Text>
          </View>
        </ScrollView>
      )}
    </SheetModal>
  );
}
