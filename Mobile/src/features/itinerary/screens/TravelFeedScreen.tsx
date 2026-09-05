import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Search from 'lucide-react-native/dist/esm/icons/search';
import LayoutGrid from 'lucide-react-native/dist/esm/icons/layout-grid';
import List from 'lucide-react-native/dist/esm/icons/list';
import SlidersHorizontal from 'lucide-react-native/dist/esm/icons/sliders-horizontal';
import ArrowDownWideNarrow from 'lucide-react-native/dist/esm/icons/arrow-down-wide-narrow';
import ArrowUpNarrowWide from 'lucide-react-native/dist/esm/icons/arrow-up-narrow-wide';
import RotateCcw from 'lucide-react-native/dist/esm/icons/rotate-ccw';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { Header, NotificationModal } from '../../../components/common';
import SheetModal from '../../../components/common/SheetModal';
import TravelFeedList, { TravelFeedItem } from '../components/TravelFeedList';
import { acceptInvitation, rejectInvitation } from '../../../api/trips';
import { useQueryClient } from '@tanstack/react-query';
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  usePendingInvitationActions,
  usePendingInvitations,
} from '../../../hooks/usePendingInvitations';
import {
  useFeedPosts,
  useFeedRegionCounts,
} from '../../community/hooks/queries';
import {
  formatDuration,
  orderLabelsFor,
} from '../../community/services/communityApi';
import { resolveAvatarUrl } from '../../community/utils/avatar';
import { buildFeedRegionOptions } from '../../community/utils/feedRegions';
import { FeedFilterParams } from '../../community/types';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import {
  describeAcceptResult,
  describeRejectResult,
} from '../../../utils/collaborationRequest';
import {
  CREATE_BUTTON_COLLAPSED,
  shouldOpenCreateButton,
} from '../utils/createButtonCollapse';

const FEED_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const DURATION_RANGES: Record<string, { minDays?: number; maxDays?: number }> = {
  '1일': { minDays: 1, maxDays: 1 },
  '2-3일': { minDays: 2, maxDays: 3 },
  '4일 이상': { minDays: 4 },
};

const SORT_PARAMS: Record<string, string> = {
  최신순: 'latest',
  인기순: 'views',
  좋아요순: 'likes',
  가져가기순: 'forks',
};


const ALL = '전체';

/**
 * 상세 필터에 늘 펴 두는 지역. 웹과 같은 열일곱 시·도다.
 *
 * 서버는 글이 있는 지역만 세어 주므로 그것만 늘어놓으면 목록이 들쭉날쭉하고,
 * 방금 비워진 지역은 고를 수조차 없다. 이름은 regionCoords가 이미 쓰는 축약형과
 * 같아야 지도 좌표가 붙는다.
 */
const FEED_REGIONS = [
  '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];
const TAGS = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];
const DURATIONS = [ALL, '1일', '2-3일', '4일 이상'];
const SORT_OPTIONS = ['최신순', '인기순', '좋아요순', '가져가기순'];

/**
 * 목록 위에 바로 두는 정렬 셋. 웹과 같다.
 *
 * 넷을 다 올리면 좁은 화면에서 줄이 넘치고, 좋아요순은 인기순과 겹쳐 읽힌다.
 * 나머지 하나와 정렬 방향은 상세 필터가 맡는다.
 */
const QUICK_SORTS = ['최신순', '인기순', '가져가기순'];

/** '가져가기순'은 정렬 이름이고, 탭에서는 웹과 같이 '가져간 순'으로 읽힌다. */
const quickSortLabel = (option: string) =>
  option === '가져가기순' ? '가져간 순' : option;

/** 상세 필터의 선택 버튼. 웹 패널과 같은 라운드 8 사각형이다. */
const FilterOption = ({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) => (
  <TouchableOpacity
    style={[styles.option, selected && styles.optionSelected]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    {icon}
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function TravelFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('최신순');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRegion, setFilterRegion] = useState(ALL);
  const [filterDuration, setFilterDuration] = useState(ALL);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const { data: pendingRequests = [] } = usePendingInvitations(!!user);
  const pendingInvitations = usePendingInvitationActions();

  const [tempSortBy, setTempSortBy] = useState('최신순');
  const [tempSortOrder, setTempSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tempDuration, setTempDuration] = useState(ALL);
  const [tempTag, setTempTag] = useState<string | null>(null);
  const [tempRegion, setTempRegion] = useState(ALL);

  const regionCountsQuery = useFeedRegionCounts();
  const regionOptions = useMemo(
    () => buildFeedRegionOptions(regionCountsQuery.data),
    [regionCountsQuery.data],
  );
  const regions = useMemo(() => {
    // 서버가 표준 목록에 없는 이름을 세어 주면 그것도 고를 수 있게 뒤에 붙인다.
    const extras = regionOptions
      .map(option => option.region)
      .filter(region => !FEED_REGIONS.includes(region));
    return [ALL, ...FEED_REGIONS, ...extras];
  }, [regionOptions]);

  const isFilterApplied =
    filterDuration !== ALL ||
    filterRegion !== ALL ||
    sortOrder !== 'desc' ||
    !!selectedTag;
  // 정렬 기준은 목록 위 탭에도 드러나 있으므로 여기서 세지 않는다 — 세면
  // 탭을 옮겼을 뿐인데 상세 필터에 뱃지가 붙어 뭘 걸었는지 헷갈린다.
  const activeFilterCount =
    (filterDuration !== ALL ? 1 : 0) +
    (filterRegion !== ALL ? 1 : 0) +
    (sortOrder !== 'desc' ? 1 : 0) +
    (selectedTag ? 1 : 0);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 목록을 내리는 동안에는 여행기 쓰기 단추를 동그랗게 접어 카드를 덜 가린다.
  // 펼친 너비와 글자 너비는 첫 배치에서 재 둔다 — 글자 크기 설정에 따라
  // 달라지므로 숫자로 박지 않는다.
  const [isCreateOpen, setCreateOpen] = useState(true);
  const [createWidth, setCreateWidth] = useState<number | null>(null);
  const [createLabelWidth, setCreateLabelWidth] = useState<number | null>(null);
  const createAnim = useRef(new Animated.Value(1)).current;
  const lastFeedOffset = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (alive) reduceMotion.current = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        reduceMotion.current = enabled;
      },
    );
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(createAnim, {
      toValue: isCreateOpen ? 1 : 0,
      duration: reduceMotion.current ? 0 : 200,
      easing: Easing.out(Easing.cubic),
      // 너비는 네이티브 드라이버로 옮길 수 없다. 움직이는 것이 단추 하나뿐이라
      // 자바스크립트 쪽에서 돌려도 끊기지 않는다.
      useNativeDriver: false,
    }).start();
  }, [isCreateOpen, createAnim]);

  const handleFeedScroll = useCallback((offsetY: number) => {
    const previous = lastFeedOffset.current;
    lastFeedOffset.current = offsetY;
    setCreateOpen(open => shouldOpenCreateButton(previous, offsetY, open));
  }, []);

  const feedFilters: FeedFilterParams = useMemo(() => {
    const duration = DURATION_RANGES[filterDuration];
    return {
      region: filterRegion === ALL ? undefined : filterRegion,
      minDays: duration?.minDays,
      maxDays: duration?.maxDays,
      tag: selectedTag ?? undefined,
      sort: SORT_PARAMS[sortBy] ?? 'latest',
      order: sortOrder,
      q: debouncedQuery || undefined,
    };
  }, [
    filterRegion,
    filterDuration,
    selectedTag,
    sortBy,
    sortOrder,
    debouncedQuery,
  ]);

  const feedQuery = useFeedPosts(feedFilters);

  const feedItems: TravelFeedItem[] = useMemo(
    () =>
      (feedQuery.data?.pages ?? [])
        .flatMap(page => page.items)
        .map(post => ({
          id: String(post.id),
          title: post.title,
          description: post.description ?? '',
          author: post.author,
          authorAvatar:
            resolveAvatarUrl(post.authorImage, post.authorAvatarHash, 100) ?? '',
          authorLevel: post.level,
          thumbnailUrl: post.image || FEED_FALLBACK_IMAGE,
          createdAt: post.createdAt,
          likes: post.likes,
          dislikes: post.dislikes,
          comments: post.comments,
          views: post.views,
          forks: post.forks ?? 0,
          tags: post.tags ?? [],
          location: post.region ?? post.location ?? '',
          duration: formatDuration(post.durationDays),
          routePlaces: post.placesByDay?.[0]?.places ?? [],
          placeCount: post.placeCount ?? 0,
        })),
    [feedQuery.data],
  );

  const handleLoadMore = useCallback(() => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      void feedQuery.fetchNextPage();
    }
  }, [feedQuery]);

  const findRequestType = (requestId: number) =>
    pendingRequests.find(r => r.requestId === requestId)?.type;

  const handleAccept = async (requestId: number) => {
    const type = findRequestType(requestId);
    try {
      await acceptInvitation(requestId);

      void invalidatePlanCaches(queryClient);
      showAlert({ title: '수락 완료', message: describeAcceptResult(type) });
      pendingInvitations.remove(requestId);
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '수락하지 못했어요.' });
    }
  };

  const handleReject = async (requestId: number) => {
    const type = findRequestType(requestId);
    try {
      await rejectInvitation(requestId);
      showAlert({ title: '거절 완료', message: describeRejectResult(type) });
      pendingInvitations.remove(requestId);
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '거절하지 못했어요.' });
    }
  };

  const onNotificationPress = () => {
    if (pendingRequests.length === 0) {
      showAlert({ title: '알림', message: '새로운 알림이 없어요.' });
      return;
    }
    setNotificationModalVisible(true);
  };

  const onNavigateProfile = () => {
    navigation.navigate('Profile');
  };

  const handleFeedItemPress = (item: TravelFeedItem) => {
    navigation.navigate('FeedDetail', { postId: item.id });
  };

  const handleCreateFeed = () => {
    if (!user) {
      showAlert({
        title: '로그인 필요',
        message: '여행기를 쓰려면 로그인이 필요해요.',
      });
      return;
    }
    navigation.navigate('FeedCreate');
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setTempDuration(filterDuration);
    setTempTag(selectedTag);
    setTempRegion(filterRegion);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setFilterDuration(tempDuration);
    setSelectedTag(tempTag);
    setFilterRegion(tempRegion);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempSortBy('최신순');
    setTempSortOrder('desc');
    setTempDuration(ALL);
    setTempTag(null);
    setTempRegion(ALL);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        nickname={user?.nickname}
        email={user?.email}
        pendingRequestsCount={pendingRequests.length}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <View style={styles.body}>
        <View style={styles.controlRowContainer}>
          <View style={styles.searchBar}>
            <Search
              size={18}
              color={tokens.colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="제목, 지역, 작성자로 검색..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={tokens.colors.textTertiary}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, isFilterApplied && styles.filterButtonActive]}
            onPress={openFilterModal}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              activeFilterCount > 0
                ? `상세 필터 ${activeFilterCount}개 적용됨`
                : '상세 필터'
            }
          >
            <SlidersHorizontal
              size={normalize(15)}
              color={
                isFilterApplied ? tokens.colors.white : tokens.colors.text
              }
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.filterButtonText,
                isFilterApplied && styles.filterButtonTextActive,
              ]}
            >
              {activeFilterCount > 0
                ? `상세 필터 ${activeFilterCount}`
                : '상세 필터'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 목록 바로 위는 정렬이 맡는다. 지역은 고를 것이 많아 상세 필터로 옮겼다. */}
        <View style={styles.sortBarContainer}>
          <View style={styles.sortTabs}>
            {QUICK_SORTS.map(option => {
              const selected = sortBy === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortTab, selected && styles.sortTabOn]}
                  onPress={() => setSortBy(option)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.sortTabText,
                      selected && styles.sortTabTextOn,
                    ]}
                  >
                    {quickSortLabel(option)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === 'list' ? '카드 보기로 전환' : '목록 보기로 전환'
            }
            hitSlop={8}
          >
            {viewMode === 'list' ? (
              <LayoutGrid
                size={normalize(17)}
                color={tokens.colors.textTertiary}
                strokeWidth={1.8}
              />
            ) : (
              <List
                size={normalize(17)}
                color={tokens.colors.primary}
                strokeWidth={1.8}
              />
            )}
          </TouchableOpacity>
        </View>


        <View style={styles.content}>
          <TravelFeedList
            items={feedItems}
            onItemPress={handleFeedItemPress}
            viewMode={viewMode}
            isLoading={feedQuery.isLoading}
            isLoadingMore={feedQuery.isFetchingNextPage}
            isRefreshing={
              feedQuery.isRefetching && !feedQuery.isFetchingNextPage
            }
            isFiltered={
              isFilterApplied || !!debouncedQuery || filterRegion !== ALL
            }
            onRefresh={() => feedQuery.refetch()}
            onLoadMore={handleLoadMore}
            onScrollOffset={handleFeedScroll}
          />
        </View>

        <AnimatedTouchable
          style={[
            styles.createButton,
            {
              paddingHorizontal: createAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, normalize(16)],
              }),
            },
            createWidth !== null && {
              width: createAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [normalize(CREATE_BUTTON_COLLAPSED), createWidth],
              }),
            },
          ]}
          onLayout={event => {
            if (createWidth === null) {
              setCreateWidth(event.nativeEvent.layout.width);
            }
          }}
          onPress={handleCreateFeed}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="여행기 쓰기"
        >
          <Plus size={20} color={tokens.colors.white} />
          {/* 접힐 때 글자 너비까지 0으로 줄여야 +가 한가운데에 온다 */}
          <Animated.Text
            style={[
              styles.createButtonText,
              { opacity: createAnim },
              createLabelWidth !== null && {
                width: createAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, createLabelWidth],
                }),
                marginLeft: createAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, normalize(6)],
                }),
              },
            ]}
            numberOfLines={1}
            onLayout={event => {
              if (createLabelWidth === null) {
                setCreateLabelWidth(event.nativeEvent.layout.width);
              }
            }}
          >
            여행기 쓰기
          </Animated.Text>
        </AnimatedTouchable>
      </View>

      <SheetModal
        visible={isFilterModalVisible}
        title="상세 필터"
        onClose={() => setFilterModalVisible(false)}
        maxHeightRatio={0.8}
        headerAction={
          <TouchableOpacity
            style={styles.resetLink}
            onPress={resetFilters}
            hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="필터 초기화"
          >
            <RotateCcw
              size={normalize(13)}
              color={tokens.colors.textSecondary}
              strokeWidth={1.8}
            />
            <Text style={styles.resetLinkText}>초기화</Text>
          </TouchableOpacity>
        }
        footer={
          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyFilters}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="필터 적용"
          >
            <Text style={styles.applyButtonText}>적용하기</Text>
          </TouchableOpacity>
        }
      >
            <ScrollView
              style={styles.bottomSheetBody}
              contentContainerStyle={styles.bottomSheetBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>지역</Text>
                <View style={styles.optionsRow}>
                  {regions.map(region => (
                    <FilterOption
                      key={region}
                      label={region}
                      selected={tempRegion === region}
                      onPress={() => setTempRegion(region)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행 기간</Text>
                <View style={styles.optionsRow}>
                  {DURATIONS.map(duration => (
                    <FilterOption
                      key={duration}
                      label={duration}
                      selected={tempDuration === duration}
                      onPress={() => setTempDuration(duration)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행 스타일</Text>
                <View style={styles.optionsRow}>
                  <FilterOption
                    label={ALL}
                    selected={tempTag === null}
                    onPress={() => setTempTag(null)}
                  />
                  {TAGS.map(tag => (
                    <FilterOption
                      key={tag}
                      label={tag}
                      selected={tempTag === tag}
                      onPress={() => setTempTag(tag)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>정렬 기준</Text>
                <View style={styles.optionsRow}>
                  {SORT_OPTIONS.map(option => (
                    <FilterOption
                      key={option}
                      label={option}
                      selected={tempSortBy === option}
                      onPress={() => setTempSortBy(option)}
                    />
                  ))}
                </View>

                <View style={styles.orderRow}>
                  {(['desc', 'asc'] as const).map(order => {
                    const labels = orderLabelsFor(tempSortBy);
                    const selected = tempSortOrder === order;
                    const Icon =
                      order === 'desc' ? ArrowDownWideNarrow : ArrowUpNarrowWide;
                    return (
                      <FilterOption
                        key={order}
                        label={labels[order]}
                        selected={selected}
                        onPress={() => setTempSortOrder(order)}
                        icon={
                          <Icon
                            size={normalize(14)}
                            color={
                              selected
                                ? tokens.colors.white
                                : tokens.colors.textSecondary
                            }
                            strokeWidth={1.8}
                          />
                        }
                      />
                    );
                  })}
                </View>
              </View>
            </ScrollView>
      </SheetModal>

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        invitations={pendingRequests}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  body: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  createButton: {
    position: 'absolute',
    right: normalize(20),
    bottom: normalize(20),
    height: normalize(CREATE_BUTTON_COLLAPSED),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.md,
  },
  createButtonText: {
    color: tokens.colors.white,
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
  },
  controlRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    gap: normalize(8),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(11),
  },

  // 아이콘만 있는 상자 대신 웹처럼 글자를 붙인 버튼으로 둔다.
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    height: normalize(40),
    paddingHorizontal: normalize(11),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  filterButtonActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterButtonText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  filterButtonTextActive: {
    color: tokens.colors.white,
  },

  // 지역은 알약 대신 밑줄 탭이다. 밑줄 2px이 아래 구분선 1px을 덮도록 겹친다.
  sortTab: {
    paddingBottom: normalize(9),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  sortTabOn: {
    borderBottomColor: tokens.colors.text,
  },
  sortTabText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  sortTabTextOn: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  viewToggle: {
    paddingBottom: normalize(9),
    paddingLeft: normalize(10),
  },
  searchIcon: {
    marginRight: normalize(8),
  },
  searchInput: {
    flex: 1,
    height: normalize(40),
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    padding: 0,
  },
  sortBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: tokens.colors.white,
    paddingHorizontal: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: normalize(12),
  },
  sortTabs: {
    flex: 1,
    flexDirection: 'row',
    gap: normalize(18),
  },
  bottomSheetBody: {
    flexShrink: 1,
  },
  bottomSheetBodyContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
  },
  filterSection: {
    marginBottom: normalize(24),
  },
  filterSectionLabel: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    marginBottom: normalize(12),
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  orderRow: {
    flexDirection: 'row',
    gap: normalize(8),
    marginTop: normalize(10),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.surface,
  },
  optionSelected: {
    backgroundColor: tokens.colors.primary,
  },
  optionText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  optionTextSelected: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.white,
  },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  resetLinkText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  applyButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
  },
  applyButtonText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },

});
