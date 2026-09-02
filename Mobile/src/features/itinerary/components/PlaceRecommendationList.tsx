import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { hapticTick } from '../../../utils/haptics';
import FallbackImage from '../../../components/common/FallbackImage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,

  ActivityIndicator,
  StyleSheet,
  Modal,
  RefreshControl,
  Linking,
} from 'react-native';
import X from 'lucide-react-native/dist/esm/icons/x';
import Bed from 'lucide-react-native/dist/esm/icons/bed';
import InfoIcon from 'lucide-react-native/dist/esm/icons/info';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import SearchIcon from 'lucide-react-native/dist/esm/icons/search';
import Umbrella from 'lucide-react-native/dist/esm/icons/umbrella';
import Utensils from 'lucide-react-native/dist/esm/icons/utensils';
import { Place } from './TimelineItem';
import KakaoMapView from './KakaoMapView';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { usePlaces } from '../../../contexts/PlacesContext';
import { useAlert } from '../../../contexts/AlertContext';
import { PlaceVO } from '../../../api/trips';
import { GoogleMapsIcon } from '../../../components/common';
import { tokens } from '../../../theme/tokens';
import { normalizeCategoryId } from '../../../utils/placeCategory';
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

const getCategoryType = (
  id: number,
): '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타' => {
  if ([0, 12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 1 || id === 32) return '숙소';
  if (id === 2 || id === 39) return '식당';
  if (id === 3) return '직접 추가';
  if (id === 4) return '검색';
  return '기타';
};

const TAB_COLORS: { [key in PlaceTab]: string } = {
  관광지: '#84cc16',
  숙소: '#f97316',
  식당: '#3b82f6',
  '직접 추가': '#8b5cf6',
  검색: tokens.colors.textSecondary,
};

type PlaceTab = '관광지' | '숙소' | '식당' | '직접 추가' | '검색';

const TAB_TO_PLACES_FIELD: Partial<
  Record<PlaceTab, 'tour' | 'lodging' | 'restaurant'>
> = {
  관광지: 'tour',
  숙소: 'lodging',
  식당: 'restaurant',
};

type EmptyStateConfig = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  note?: string;
};

const EMPTY_STATE_CONFIG: Record<
  Exclude<PlaceTab, '검색'>,
  EmptyStateConfig
> = {
  관광지: {
    icon: Umbrella,
    iconColor: '#84cc16',
    iconBackground: '#ecfccb',
    title: '관광지 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  숙소: {
    icon: Bed,
    iconColor: '#f97316',
    iconBackground: '#ffedd5',
    title: '숙소 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  식당: {
    icon: Utensils,
    iconColor: '#3b82f6',
    iconBackground: '#dbeafe',
    title: '식당 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  '직접 추가': {
    icon: Pencil,
    iconColor: '#8b5cf6',
    iconBackground: '#ede9fe',
    title: "위 일정에 맞춰 장소 이름을 입력하고 '추가' 버튼을 눌러보세요.",
    subtitle: '추가된 장소는 일정에 바로 반영돼요.',
    note: '추가된 장소는 순서에 따라 자동 저장돼요.',
  },
};

function placeVOToPlace(
  p: PlaceVO,
  tabOverride?: string,
): Omit<Place, 'startTime' | 'endTime'> {
  const type = tabOverride
    ? (tabOverride as Place['type'])
    : getCategoryType(p.categoryId);
  return {
    id: p.placeId,
    placeRefId: p.placeId,
    categoryId: normalizeCategoryId(p.categoryId, type),
    name: p.name,
    type,
    address: p.formatted_address,
    rating: p.rating,
    imageUrl: p.photoUrl || p.iconUrl || '',
    latitude: p.yLocation ?? p.ylocation ?? 0,
    longitude: p.xLocation ?? p.xlocation ?? 0,
    contentTypeId: p.contentTypeId || '',
    copyrightDivCd: p.copyrightDivCd || '',
  };
}

const PlaceImage = React.memo(
  ({
    placeId,
    iconUrl,
    name,
  }: {
    placeId: string;
    iconUrl?: string;
    name: string;
  }) => {
    const primaryUrl = placeId
      ? resolveApiUrl(`/image/place/${encodeURIComponent(placeId)}`)
      : null;

    const initials = (
      <View style={[plStyles.placeImage, plStyles.placeholderImage]}>
        <Text style={plStyles.placeholderText}>{name?.charAt(0) || '?'}</Text>
      </View>
    );

    // 프록시 → 아이콘 → 이니셜 3단계. 중첩해야 아이콘까지 실패했을 때도
    // 이니셜로 내려간다 — 플래그 하나로는 2단째 실패를 잡지 못했다.
    return (
      <FallbackImage
        uri={primaryUrl}
        style={plStyles.placeImage}
        fallback={
          <FallbackImage
            uri={iconUrl}
            style={plStyles.placeImage}
            fallback={initials}
          />
        }
      />
    );
  },
);

const PlaceMapModal = React.memo(
  ({
    visible,
    place,
    onClose,
  }: {
    visible: boolean;
    place: PlaceVO | null;
    onClose: () => void;
  }) => {
    if (!place) return null;

    const lat = place.yLocation ?? place.ylocation ?? 0;
    const lng = place.xLocation ?? place.xlocation ?? 0;

    if (lat === 0 && lng === 0) return null;

    const mapPlaces = [
      {
        id: place.placeId,
        name: place.name,
        address: place.formatted_address,
        latitude: lat,
        longitude: lng,
      },
    ];

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={plStyles.mapModalContainer}>
          <View style={plStyles.mapModalHeader}>
            <Text style={plStyles.mapModalTitle} numberOfLines={1}>
              {place.name}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={plStyles.mapModalClose}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
            >
              <X size={16} color={tokens.colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <KakaoMapView places={mapPlaces} style={plStyles.mapModalMap} />
        </View>
      </Modal>
    );
  },
);

export type { PlaceTab };

/** 갈래 순서. 시트 손잡이가 같은 줄을 그리므로 한 곳에서 내보낸다. */
export const PLACE_TABS: PlaceTab[] = ['관광지', '숙소', '식당', '직접 추가', '검색'];

/** 꾹 누른 것으로 치는 시간. 스크롤을 시작하려던 손가락을 뺏지 않을 만큼은 길어야 한다. */
export const PLACE_PICK_UP_MS = 350;

/**
 * 꾹 눌러 집는 장소 한 줄.
 *
 * 짧게 누르면 상세, 0.35초 누르면 집힌다. 집힌 뒤로는 손가락의 화면 좌표를
 * 그대로 넘겨, 어디에 놓을지는 시간표를 아는 쪽에서 계산한다.
 */
const PickUpPlaceRow = React.memo(function PickUpPlaceRow({
  place,
  children,
  onPress,
  onPickUp,
  onDrag,
  onDrop,
  onCancel,
}: {
  place: Omit<Place, 'startTime' | 'endTime'>;
  children: React.ReactNode;
  onPress?: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
  onPickUp: (
    place: Omit<Place, 'startTime' | 'endTime'>,
    absoluteY: number,
  ) => void;
  onDrag?: (absoluteY: number) => void;
  onDrop?: (absoluteY: number) => void;
  onCancel?: () => void;
}) {
  const [held, setHeld] = useState(false);
  // 누르는 0.35초 동안 아무 일도 없으면 고장 난 것처럼 느껴진다.
  // 링이나 아이콘 대신 행이 서서히 눌리는 것으로 시간이 흐르는 걸 보여준다.
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // 끄는 도중 제스처 객체가 새로 만들어지면 RNGH가 진행 중인 제스처를 취소한다.
  // 집는 순간 부모가 상태를 바꾸며 콜백 신원이 바뀌므로, 최신 값은 ref로만 읽고
  // 제스처는 한 번 만든 것을 끝까지 쓴다.
  const latest = useRef({ place, onPress, onPickUp, onDrag, onDrop, onCancel });
  latest.current = { place, onPress, onPickUp, onDrag, onDrop, onCancel };

  const gesture = useMemo(() => {
    // runOnJS(true)로 두면 핸들러가 JS 스레드에서 돌아 worklet 제약을 받지 않는다.
    const pan = Gesture.Pan()
      .runOnJS(true)
      .activateAfterLongPress(PLACE_PICK_UP_MS)
      .onBegin(() => {
        pressScale.value = withTiming(0.965, { duration: PLACE_PICK_UP_MS });
      })
      .onStart(e => {
        pressScale.value = withTiming(1, { duration: 120 });
        hapticTick();
        setHeld(true);
        latest.current.onPickUp(latest.current.place, e.absoluteY);
      })
      .onUpdate(e => {
        latest.current.onDrag?.(e.absoluteY);
      })
      .onEnd(e => {
        latest.current.onDrop?.(e.absoluteY);
      })
      .onFinalize((_e, success) => {
        pressScale.value = withTiming(1, { duration: 120 });
        setHeld(false);
        if (!success) latest.current.onCancel?.();
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => latest.current.onPress?.(latest.current.place));

    return Gesture.Exclusive(pan, tap);
  }, [pressScale]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[plStyles.placeCard, pressStyle, held && plStyles.placeCardHeld]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

interface PlaceRecommendationListProps {
  destination?: string;

  travelId: number | null;
  onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;

  /** 갈래 탭을 바깥(시트 손잡이)에서 그릴 때 쓴다. 주면 목록은 탭을 그리지 않는다. */
  selectedTab?: PlaceTab;
  onSelectTab?: (tab: PlaceTab) => void;
  hideTabs?: boolean;

  /** 짧게 누르기 — 상세 보기 */
  onPressPlace?: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
  /** 꾹 눌러 집기 — 이후 onDragPlace/onDropPlace가 화면 좌표로 이어진다 */
  onPickUpPlace?: (
    place: Omit<Place, 'startTime' | 'endTime'>,
    absoluteY: number,
  ) => void;
  onDragPlace?: (absoluteY: number) => void;
  onDropPlace?: (absoluteY: number) => void;
  onCancelPickUp?: () => void;
}

export default function PlaceRecommendationList({
  destination,
  travelId,
  onAddPlace,
  selectedTab: controlledTab,
  onSelectTab,
  hideTabs = false,
  onPressPlace,
  onPickUpPlace,
  onDragPlace,
  onDropPlace,
  onCancelPickUp,
}: PlaceRecommendationListProps) {
  const {
    tour,
    lodging,
    restaurant,
    tourHasNext,
    lodgingHasNext,
    restaurantHasNext,
    isLoading,
    loadMorePlaces,
    fetchAllRecommendations,
    isPetFriendly,
    setPetFriendly,
  } = usePlaces();

  const { showAlert } = useAlert();
  const [innerTab, setInnerTab] = useState<PlaceTab>('관광지');
  // 시트 손잡이가 탭을 그릴 때는 바깥이 값을 쥔다. 아니면 예전처럼 스스로 쥔다.
  const selectedTab = controlledTab ?? innerTab;
  const setSelectedTab = useCallback(
    (tab: PlaceTab) => (onSelectTab ? onSelectTab(tab) : setInnerTab(tab)),
    [onSelectTab],
  );
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setPetFriendly(false);
  }, [setPetFriendly]);

  const handleRefresh = useCallback(async () => {
    if (!travelId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchAllRecommendations(travelId, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [travelId, isRefreshing, fetchAllRecommendations]);

  const handleDirectAdd = useCallback(() => {
    const trimmedName = customPlaceName.trim();

    if (!trimmedName) {
      return;
    }

    const placeId = `custom_${Date.now()}`;
    onAddPlace({
      id: placeId,
      placeRefId: placeId,
      name: trimmedName,
      type: '직접 추가',
      categoryId: 3,
      address: destination ?? '',
      rating: 0,
      imageUrl: '',
      latitude: 0,
      longitude: 0,
    });
    setCustomPlaceName('');
  }, [customPlaceName, destination, onAddPlace]);

  const getTabData = (): PlaceVO[] => {
    let rawData: PlaceVO[] = [];
    switch (selectedTab) {
      case '관광지':
        rawData = tour;
        break;
      case '숙소':
        rawData = lodging;
        break;
      case '식당':
        rawData = restaurant;
        break;
      default:
        rawData = [];
    }

    if (isPetFriendly) {
      const keywords = ['반려', '애견', '동반', '펫', 'pet', 'dog', '동물', '카페', '펜션', '공원', '해수욕장', '캠핑'];
      return rawData.filter(item => {
        const name = item.name || '';
        const address = item.formatted_address || '';
        return keywords.some(keyword => name.toLowerCase().includes(keyword) || address.toLowerCase().includes(keyword));
      });
    }
    return rawData;
  };

  const checkHasMoreData = (): boolean => {
    switch (selectedTab) {
      case '관광지':
        return tourHasNext;
      case '숙소':
        return lodgingHasNext;
      case '식당':
        return restaurantHasNext;
      default:
        return false;
    }
  };

  const tabData = getTabData();
  const hasMoreData = checkHasMoreData();

  const handleLoadMore = useCallback(() => {
    if (!hasMoreData || isLoading) return;
    const field = TAB_TO_PLACES_FIELD[selectedTab];
    if (!field) return;
    loadMorePlaces(field);
  }, [hasMoreData, isLoading, loadMorePlaces, selectedTab]);

  const [mapPlace, setMapPlace] = useState<PlaceVO | null>(null);
  const [isMapVisible, setMapVisible] = useState(false);

  const handleCloseMap = useCallback(() => {
    setMapVisible(false);
    setMapPlace(null);
  }, []);

  const handleOpenGoogleMaps = useCallback(async (item: PlaceVO) => {
    const lat = item.yLocation ?? item.ylocation;
    const lng = item.xLocation ?? item.xlocation;

    if (!lat || !lng) {
      showAlert({
        title: '지도를 열 수 없음',
        message: '이 장소의 위치 정보가 없어요.',
        type: 'error',
      });
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${item.placeId}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {

        showAlert({
          title: '지도를 열 수 없음',
          message: '이 기기에서 구글 지도를 열 수 없어요.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to open Google Maps:', error);
    }
  }, [showAlert]);

  // 집힌 뒤 손가락을 움직이면 목록의 스크롤이 제스처를 가로채 끌기가 끝나버린다.
  // 집는 순간에는 아직 움직이기 전이라, 그때 스크롤을 잠그면 뺏기지 않는다.
  const [isDraggingPlace, setIsDraggingPlace] = useState(false);

  const beginDrag = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>, absoluteY: number) => {
      setIsDraggingPlace(true);
      onPickUpPlace?.(place, absoluteY);
    },
    [onPickUpPlace],
  );

  const endDrag = useCallback(
    (absoluteY: number) => {
      setIsDraggingPlace(false);
      onDropPlace?.(absoluteY);
    },
    [onDropPlace],
  );

  const abortDrag = useCallback(() => {
    setIsDraggingPlace(false);
    onCancelPickUp?.();
  }, [onCancelPickUp]);

  const renderPlaceBody = useCallback(
    (item: PlaceVO) => (
      <>
        <PlaceImage
          placeId={item.placeId}
          iconUrl={item.iconUrl}
          name={item.name}
        />

        <View style={plStyles.placeInfo}>
          <Text style={plStyles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={plStyles.metaRow}>
            {item.rating > 0 && (
              <View style={plStyles.ratingContainer}>
                <Text style={plStyles.starIcon}>★</Text>
                <Text style={plStyles.ratingText}>{item.rating}</Text>
              </View>
            )}
            <Text style={plStyles.addressText} numberOfLines={1}>
              {item.formatted_address}
            </Text>
          </View>
        </View>

        <View style={plStyles.actionGroup}>
          <TouchableOpacity
            style={plStyles.mapButton}
            onPress={e => {
              e.stopPropagation?.();
              handleOpenGoogleMaps(item);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="지도에서 보기"
          >
            <GoogleMapsIcon size={20} />
          </TouchableOpacity>
        </View>
      </>
    ),
    [handleOpenGoogleMaps],
  );

  const renderPlaceItem = useCallback(
    ({ item }: { item: PlaceVO }) => {
      const place = placeVOToPlace(item, getCategoryType(item.categoryId));

      // 꾹 누르기를 쓰지 않는 자리에서는 예전처럼 누르면 바로 담긴다.
      if (!onPickUpPlace) {
        return (
          <TouchableOpacity
            style={plStyles.placeCard}
            activeOpacity={0.7}
            onPress={() => onAddPlace(place)}
          >
            {renderPlaceBody(item)}
          </TouchableOpacity>
        );
      }

      return (
        <PickUpPlaceRow
          place={place}
          onPress={onPressPlace}
          onPickUp={beginDrag}
          onDrag={onDragPlace}
          onDrop={endDrag}
          onCancel={abortDrag}
        >
          {renderPlaceBody(item)}
        </PickUpPlaceRow>
      );
    },
    [
      onAddPlace,
      onPressPlace,
      onPickUpPlace,
      onDragPlace,
      beginDrag,
      endDrag,
      abortDrag,
      renderPlaceBody,
    ],
  );

  const renderFooter = useCallback(() => {
    if (isLoading) {
      return (
        <View style={plStyles.footerLoading}>
          <ActivityIndicator size="small" color={tokens.colors.primary} />
        </View>
      );
    }
    if (hasMoreData) {
      return (
        <TouchableOpacity
          style={plStyles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={plStyles.loadMoreText}>더 불러오기</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }, [isLoading, hasMoreData, handleLoadMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    if (selectedTab === '검색') {
      return (
        <View style={plStyles.emptyContainer}>
          <View style={[plStyles.emptyIconWrapper, plStyles.emptyIconSearch]}>
            <SearchIcon size={28} color={tokens.colors.textTertiary} />
          </View>
          <Text style={plStyles.emptyTitle}>장소 검색은 준비 중이에요.</Text>
          <Text style={plStyles.emptySubtitle}>
            지금은 관광지·숙소·식당 탭에서 추천 장소를 담을 수 있어요.
          </Text>
          <Text style={plStyles.emptySubtitle}>
            찾는 장소가 없다면 '직접 추가' 탭을 이용해보세요.
          </Text>
        </View>
      );
    }

    const config = EMPTY_STATE_CONFIG[selectedTab];

    return (
      <View style={plStyles.emptyContainer}>
        <View
          style={[
            plStyles.emptyIconWrapper,
            { backgroundColor: config.iconBackground },
          ]}
        >
          <config.icon size={28} color={config.iconColor} />
        </View>
        <Text style={plStyles.emptyTitle}>{config.title}</Text>
        <Text style={plStyles.emptySubtitle}>{config.subtitle}</Text>
        {config.note && (
          <View style={plStyles.emptyNotePill}>
            <InfoIcon size={12} color={tokens.colors.textSecondary} />
            <Text style={plStyles.emptyNoteText}>{config.note}</Text>
          </View>
        )}
      </View>
    );
  }, [isLoading, selectedTab]);

  const renderHeader = useCallback(() => {

    if (selectedTab === '검색') {
      return null;
    }

    if (selectedTab === '직접 추가') {
      return (
        <View style={plStyles.searchContainer}>
          <View style={plStyles.searchField}>
            <Pencil size={16} color="#8B5CF6" />
            <TextInput
              value={customPlaceName}
              onChangeText={setCustomPlaceName}
              onSubmitEditing={handleDirectAdd}
              placeholder="장소 이름을 입력하세요"
              placeholderTextColor={tokens.colors.textTertiary}
              returnKeyType="done"
              style={plStyles.searchInput}
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={[
              plStyles.searchActionButton,
              !customPlaceName.trim()
                ? plStyles.searchActionButtonDisabled
                : plStyles.searchActionButtonPurple,
            ]}
            onPress={handleDirectAdd}
            disabled={!customPlaceName.trim()}
            activeOpacity={0.85}
            accessibilityState={{ disabled: !customPlaceName.trim() }}
          >
            <Text style={plStyles.searchActionButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [selectedTab, customPlaceName, handleDirectAdd]);

  return (
    <View style={plStyles.container}>

      {hideTabs ? null : (
      <View style={plStyles.tabContainer}>
        {PLACE_TABS.map(
          tab => {
            const isSelected = selectedTab === tab;
            const tabColor = TAB_COLORS[tab];
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  plStyles.tab,
                  plStyles.categoryTabBase,
                  isSelected && {
                    backgroundColor: tabColor,
                    borderColor: tabColor,
                  },
                ]}
              >
                <Text
                  style={[
                    plStyles.tabText,
                    plStyles.categoryTabText,
                    isSelected && { color: tokens.colors.white, fontFamily: FONTS.bold },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>
      )}

      <FlatList
        data={tabData}
        keyExtractor={(item, index) => `${item.placeId}_${index}`}
        renderItem={renderPlaceItem}

        ListEmptyComponent={renderEmpty()}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        contentContainerStyle={plStyles.listContent}
        scrollEnabled={!isDraggingPlace}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[tokens.colors.primary]}
            tintColor={tokens.colors.primary}
          />
        }
      />

      <PlaceMapModal
        visible={isMapVisible}
        place={mapPlace}
        onClose={handleCloseMap}
      />
    </View>
  );
}

const plStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    borderBottomColor: tokens.colors.primary,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabDotInactive: {
    backgroundColor: '#D1D5DB',
  },
  tabText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: tokens.colors.textTertiary,
  },
  tabTextSelected: {
    color: tokens.colors.primary,
    fontFamily: FONTS.bold,
  },
  categoryTabBase: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  categoryTabText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: 10,
  },
  searchField: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    color: tokens.colors.text,
    fontFamily: FONTS.regular,
  },
  searchActionButton: {
    minWidth: 74,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchActionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  searchActionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchActionButtonText: {
    color: tokens.colors.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  // 집힌 동안은 원래 자리를 흐리게 둔다. 손끝을 따라다니는 쪽이 진짜다.
  placeCardHeld: {
    opacity: 0.35,
  },
  placeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: tokens.colors.textTertiary,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 4,
  },
  placeName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: '#FACC15',
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: FONTS.regular,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.textSecondary,
    fontFamily: FONTS.regular,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  mapModalTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
    marginRight: 12,
  },
  mapModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalMap: {
    flex: 1,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: tokens.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 360,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyIconSearch: {
    backgroundColor: tokens.colors.borderLight,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 25,
    color: tokens.colors.text,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: tokens.colors.textTertiary,
    fontFamily: FONTS.regular,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyNotePill: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: tokens.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyNoteText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  filterLabelRow: {
    flexDirection: 'column',
    gap: 2,
  },
  filterLabelText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
  },
  filterSubText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: tokens.colors.textSecondary,
  },
  filterToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#10B981',
  },
  filterToggleInactive: {
    backgroundColor: '#D1D5DB',
  },
  filterToggleBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterToggleBallActive: {
    alignSelf: 'flex-end',
  },
  filterToggleBallInactive: {
    alignSelf: 'flex-start',
  },
});
