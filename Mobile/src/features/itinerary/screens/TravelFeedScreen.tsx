import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Search from 'lucide-react-native/dist/esm/icons/search';
import LayoutGrid from 'lucide-react-native/dist/esm/icons/layout-grid';
import List from 'lucide-react-native/dist/esm/icons/list';
import SlidersHorizontal from 'lucide-react-native/dist/esm/icons/sliders-horizontal';
import X from 'lucide-react-native/dist/esm/icons/x';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import MapIcon from 'lucide-react-native/dist/esm/icons/map';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { Header, NotificationModal } from '../../../components/common';
import { Chip } from '../../../components/ui';
import TravelFeedList, { TravelFeedItem } from '../components/TravelFeedList';
import KakaoMapView, { MapPlace } from '../components/KakaoMapView';
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
import { formatDuration } from '../../community/services/communityApi';
import { resolveAvatarUrl } from '../../community/utils/avatar';
import { buildFeedRegionOptions } from '../../community/utils/feedRegions';
import { getRegionCoords } from '../../community/utils/regionCoords';
import { FeedFilterParams } from '../../community/types';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import {
  describeAcceptResult,
  describeRejectResult,
} from '../../../utils/collaborationRequest';

const FEED_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800';

const DURATION_RANGES: Record<string, { minDays?: number; maxDays?: number }> = {
  '1일': { minDays: 1, maxDays: 1 },
  '2-3일': { minDays: 2, maxDays: 3 },
  '4일 이상': { minDays: 4 },
};

const SORT_PARAMS: Record<string, string> = {
  최신순: 'latest',
  인기순: 'views',
  좋아요순: 'likes',
};

const ALL = '전체';
const TAGS = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];
const DURATIONS = [ALL, '1일', '2-3일', '4일 이상'];
const SORT_OPTIONS = ['최신순', '인기순', '좋아요순'];

export default function TravelFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('최신순');
  const [filterRegion, setFilterRegion] = useState(ALL);
  const [filterDuration, setFilterDuration] = useState(ALL);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const { data: pendingRequests = [] } = usePendingInvitations(!!user);
  const pendingInvitations = usePendingInvitationActions();

  const [tempSortBy, setTempSortBy] = useState('최신순');
  const [tempDuration, setTempDuration] = useState(ALL);
  const [tempTag, setTempTag] = useState<string | null>(null);

  const regionCountsQuery = useFeedRegionCounts();
  const regionOptions = useMemo(
    () => buildFeedRegionOptions(regionCountsQuery.data),
    [regionCountsQuery.data],
  );
  const regions = useMemo(
    () => [ALL, ...regionOptions.map(option => option.region)],
    [regionOptions],
  );
  const regionCountByName = useMemo(
    () => new Map(regionOptions.map(option => [option.region, option.count])),
    [regionOptions],
  );

  const isFilterApplied =
    filterDuration !== ALL || sortBy !== '최신순' || !!selectedTag;
  const activeFilterCount =
    (filterDuration !== ALL ? 1 : 0) +
    (sortBy !== '최신순' ? 1 : 0) +
    (selectedTag ? 1 : 0);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (
      regionCountsQuery.isSuccess &&
      filterRegion !== ALL &&
      !regions.includes(filterRegion)
    ) {
      setFilterRegion(ALL);
      Toast.show({
        type: 'info',
        text1: `'${filterRegion}' 지역의 여행기가 없어 전체로 되돌렸어요.`,
        position: 'top',
        visibilityTime: 2500,
      });
    }
  }, [filterRegion, regions, regionCountsQuery.isSuccess]);

  const feedFilters: FeedFilterParams = useMemo(() => {
    const duration = DURATION_RANGES[filterDuration];
    return {
      region: filterRegion === ALL ? undefined : filterRegion,
      minDays: duration?.minDays,
      maxDays: duration?.maxDays,
      tag: selectedTag ?? undefined,
      sort: SORT_PARAMS[sortBy] ?? 'latest',
      q: debouncedQuery || undefined,
    };
  }, [filterRegion, filterDuration, selectedTag, sortBy, debouncedQuery]);

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
          thumbnailUrl: post.image ?? FEED_FALLBACK_IMAGE,
          createdAt: post.createdAt,
          likes: post.likes,
          dislikes: post.dislikes,
          comments: post.comments,
          views: post.views,
          forks: post.forks ?? 0,
          tags: post.tags ?? [],
          location: post.location ?? post.region ?? '',
          duration: formatDuration(post.durationDays),
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
      showAlert({ title: '오류', message: '수락 처리에 실패했습니다.' });
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
      showAlert({ title: '오류', message: '거절 처리에 실패했습니다.' });
    }
  };

  const onNotificationPress = () => {
    if (pendingRequests.length === 0) {
      showAlert({ title: '알림', message: '새로운 알림이 없습니다.' });
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
        message: '여행기를 발행하려면 로그인이 필요합니다.',
      });
      return;
    }
    navigation.navigate('FeedCreate');
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempDuration(filterDuration);
    setTempTag(selectedTag);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setFilterDuration(tempDuration);
    setSelectedTag(tempTag);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempSortBy('최신순');
    setTempDuration(ALL);
    setTempTag(null);
  };

  // 게시글이 있는 지역 중 좌표를 아는 곳만 지도에 올린다
  const mapPlaces = useMemo(
    (): MapPlace[] =>
      regionOptions
        .map(option => {
          const coords = getRegionCoords(option.region);
          if (!coords) return null;
          return {
            id: option.region,
            name: `${option.region} (${option.count})`,
            address: `${option.region} 여행기 ${option.count}건`,
            latitude: coords.lat,
            longitude: coords.lng,
          };
        })
        .filter((place): place is MapPlace => place !== null),
    [regionOptions],
  );

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
            style={styles.iconButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === 'list' ? '카드 보기로 전환' : '목록 보기로 전환'
            }
          >
            {viewMode === 'list' ? (
              <LayoutGrid size={20} color={tokens.colors.textSecondary} />
            ) : (
              <List size={20} color={tokens.colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, isFilterApplied && styles.iconButtonActive]}
            onPress={openFilterModal}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              activeFilterCount > 0
                ? `필터 ${activeFilterCount}개 적용됨`
                : '필터'
            }
          >
            <SlidersHorizontal
              size={20}
              color={
                isFilterApplied
                  ? tokens.colors.primary
                  : tokens.colors.textSecondary
              }
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.regionBarContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setMapModalVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="여행지 지도 보기"
          >
            <MapIcon size={16} color={tokens.colors.primary} />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionBarContent}
          >
            {regions.map(region => (
              <Chip
                key={region}
                label={region}
                size="s"
                count={
                  region === ALL ? undefined : regionCountByName.get(region)
                }
                selected={filterRegion === region}
                onPress={() => setFilterRegion(region)}
              />
            ))}
          </ScrollView>
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
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateFeed}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="여행기 발행"
        >
          <Plus size={20} color={tokens.colors.white} />
          <Text style={styles.createButtonText}>여행기 발행</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalDismissOverlay}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>상세 필터</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="닫기"
              >
                <X size={20} color={tokens.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.bottomSheetBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행 기간</Text>
                <View style={styles.chipsContainer}>
                  {DURATIONS.map(duration => (
                    <Chip
                      key={duration}
                      label={duration}
                      variant="soft"
                      selected={tempDuration === duration}
                      onPress={() => setTempDuration(duration)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행 스타일</Text>
                <View style={styles.chipsContainer}>
                  <Chip
                    label={ALL}
                    variant="soft"
                    selected={tempTag === null}
                    onPress={() => setTempTag(null)}
                  />
                  {TAGS.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="soft"
                      selected={tempTag === tag}
                      onPress={() => setTempTag(tag)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>정렬 기준</Text>
                <View style={styles.chipsContainer}>
                  {SORT_OPTIONS.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      variant="soft"
                      selected={tempSortBy === option}
                      onPress={() => setTempSortBy(option)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.applyButtonText}>적용하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <View style={styles.mapModalTitleRow}>
              <MapPin size={20} color={tokens.colors.primary} />
              <Text style={styles.mapModalTitle}>전체 여행지 지도</Text>
              <View style={styles.mapModalCountBadge}>
                <Text style={styles.mapModalCountText}>
                  {mapPlaces.length}곳
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.mapModalCloseButton}
              onPress={() => setMapModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={22} color={tokens.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <KakaoMapView places={mapPlaces} style={styles.mapView} />
          </View>
        </View>
      </Modal>

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
    minHeight: normalize(48),
    paddingHorizontal: normalize(16),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
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
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(12),
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
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryTint,
  },
  filterCountBadge: {
    position: 'absolute',
    top: normalize(-5),
    right: normalize(-5),
    minWidth: normalize(17),
    height: normalize(17),
    paddingHorizontal: normalize(4),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  regionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
    paddingLeft: normalize(16),
    paddingBottom: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: normalize(8),
  },
  mapButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionBarContent: {
    paddingRight: normalize(16),
    gap: normalize(6),
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheetContainer: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    padding: normalize(24),
    maxHeight: '80%',
    ...tokens.shadows.md,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  bottomSheetTitle: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  bottomSheetBody: {
    marginBottom: normalize(24),
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  bottomSheetFooter: {
    flexDirection: 'row',
    gap: normalize(12),
    paddingBottom: Platform.OS === 'ios' ? normalize(12) : 0,
  },
  resetButton: {
    flex: 1,
    height: normalize(48),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
  },
  resetButtonText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    height: normalize(48),
    borderRadius: tokens.radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
  },
  applyButtonText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },

  mapModalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(16),
    paddingBottom: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  mapModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  mapModalTitle: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  mapModalCountBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primaryTint,
  },
  mapModalCountText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  mapModalCloseButton: {
    padding: normalize(4),
  },
  mapContainer: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  mapView: {
    flex: 1,
  },
});
