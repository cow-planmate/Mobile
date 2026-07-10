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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Plus, LayoutGrid, List, SlidersHorizontal, X, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { Header, NotificationModal } from '../../../components/common';
import TravelFeedList, { TravelFeedItem } from '../components/TravelFeedList';
import KakaoMapView, { MapPlace } from '../components/KakaoMapView';
import {
  getPendingInvitations,
  PendingInvitation,
  acceptInvitation,
  rejectInvitation,
} from '../../../api/trips';

const REGION_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  '서울': { lat: 37.5665, lng: 126.9780, name: '서울' },
  '부산': { lat: 35.1796, lng: 129.0756, name: '부산' },
  '제주도': { lat: 33.4996, lng: 126.5312, name: '제주도' },
  '강릉': { lat: 37.7518, lng: 128.8761, name: '강릉' },
  '경주': { lat: 35.8562, lng: 129.2247, name: '경주' },
  '전주': { lat: 35.8242, lng: 127.1480, name: '전주' },
};

export default function TravelFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showAlert } = useAlert();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState('최신순');
  const [filterRegion, setFilterRegion] = useState('전체');
  const [filterDuration, setFilterDuration] = useState('전체');

  // 모달 상태
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  // 임시 필터 상태
  const [tempSortBy, setTempSortBy] = useState('최신순');
  const [tempRegion, setTempRegion] = useState('전체');
  const [tempDuration, setTempDuration] = useState('전체');

  const tags = ['#뚜벅이최적화', '#극한의J', '#여유로운P', '#동선낭비없는'];
  const regions = ['전체', '서울', '부산', '제주도', '강릉', '경주', '전주'];
  const durations = ['전체', '1일', '2-3일', '4일 이상'];
  const sortOptions = ['최신순', '인기순', '좋아요순'];

  const isFilterApplied = filterRegion !== '전체' || filterDuration !== '전체' || sortBy !== '최신순';

  const fetchPendingRequests = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const requests = await getPendingInvitations();
      if (requests) {
        setPendingRequests(requests);
      }
    } catch (error) {
      console.log('초대 요청 목록 조회 실패:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPendingRequests();
  }, [fetchPendingRequests]);

  useFocusEffect(
    useCallback(() => {
      void fetchPendingRequests(true);
    }, [fetchPendingRequests])
  );

  const handleAccept = async (requestId: number) => {
    try {
      await acceptInvitation(requestId);
      showAlert({ title: '수락 완료', message: '일정에 참여했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '수락 처리에 실패했습니다.' });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectInvitation(requestId);
      showAlert({ title: '거절 완료', message: '초대를 거절했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
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
    showAlert({
      title: '여행기 상세',
      message: `'${item.title}' 상세 페이지는 준비 중입니다.`,
    });
  };

  const handleCreatePlan = () => {
    navigation.navigate('ScheduleTab', { screen: 'Home' });
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempRegion(filterRegion);
    setTempDuration(filterDuration);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setFilterRegion(tempRegion);
    setFilterDuration(tempDuration);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempSortBy('최신순');
    setTempRegion('전체');
    setTempDuration('전체');
  };

  // 지도 마커 장소 변환
  const mapPlaces = useMemo((): MapPlace[] => {
    return Object.keys(REGION_COORDINATES).map((key, idx) => {
      const coord = REGION_COORDINATES[key];
      return {
        id: String(idx + 1),
        name: coord.name,
        address: `${coord.name} 지역 여행지 지도`,
        latitude: coord.lat,
        longitude: coord.lng,
      };
    });
  }, []);

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
      
      {/* 🔍 1행 통합 컨트롤 바 (검색창 + 레이아웃 + 필터) */}
      <View style={styles.controlRowContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="제목, 지역, 작성자로 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          activeOpacity={0.8}
        >
          {viewMode === 'list' ? (
            <LayoutGrid size={20} color="#4B5563" />
          ) : (
            <List size={20} color="#4B5563" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconButton,
            isFilterApplied && styles.iconButtonActive
          ]}
          onPress={openFilterModal}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={20} color={isFilterApplied ? '#1344FF' : '#4B5563'} />
          {isFilterApplied && <View style={styles.activeFilterDot} />}
        </TouchableOpacity>
      </View>

      {/* 🏷️ 가로 스크롤 태그 필터 바 */}
      <View style={styles.tagBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagBarContent}
        >
          <TouchableOpacity
            style={[
              styles.tagChip,
              selectedTag === null && styles.tagChipActive
            ]}
            onPress={() => setSelectedTag(null)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tagText,
                selectedTag === null && styles.tagTextActive
              ]}
            >
              전체
            </Text>
          </TouchableOpacity>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                selectedTag === tag && styles.tagChipActive
              ]}
              onPress={() => setSelectedTag(tag)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTag === tag && styles.tagTextActive
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <TravelFeedList
          onItemPress={handleFeedItemPress}
          searchQuery={searchQuery}
          selectedTag={selectedTag}
          viewMode={viewMode}
          sortBy={sortBy}
          filterRegion={filterRegion}
          filterDuration={filterDuration}
        />
      </View>

      {/* 🗺️ 에어비앤비 스타일 하단 중앙 플로팅 지도 버튼 */}
      <TouchableOpacity
        style={styles.mapFloatingButton}
        onPress={() => setMapModalVisible(true)}
        activeOpacity={0.9}
      >
        <MapPin size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.mapFloatingButtonText}>지도보기</Text>
      </TouchableOpacity>

      {/* ➕ 계획 생성 플로팅 버튼 (FAB) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreatePlan}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* 🧭 바텀 시트 상세 필터 모달 */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissOverlay} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>상세 필터</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
              {/* 지역 필터 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행지</Text>
                <View style={styles.chipsContainer}>
                  {regions.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.filterChip,
                        tempRegion === r && styles.filterChipActive
                      ]}
                      onPress={() => setTempRegion(r)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          tempRegion === r && styles.filterChipTextActive
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 기간 필터 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>여행 기간</Text>
                <View style={styles.chipsContainer}>
                  {durations.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.filterChip,
                        tempDuration === d && styles.filterChipActive
                      ]}
                      onPress={() => setTempDuration(d)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          tempDuration === d && styles.filterChipTextActive
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 정렬 필터 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>정렬 기준</Text>
                <View style={styles.chipsContainer}>
                  {sortOptions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.filterChip,
                        tempSortBy === s && styles.filterChipActive
                      ]}
                      onPress={() => setTempSortBy(s)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          tempSortBy === s && styles.filterChipTextActive
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>적용하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🗺️ 전체 여행지 지도 모달 */}
      <Modal
        visible={isMapModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <View style={styles.mapModalTitleRow}>
              <MapPin size={20} color="#1344FF" style={{ marginRight: 6 }} />
              <Text style={styles.mapModalTitle}>전체 여행지 지도</Text>
            </View>
            <TouchableOpacity
              style={styles.mapModalCloseButton}
              onPress={() => setMapModalVisible(false)}
            >
              <X size={22} color="#111827" />
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
        invitations={pendingRequests as any}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  controlRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconButtonActive: {
    borderColor: '#1344FF',
    backgroundColor: '#F0F4FF',
  },
  activeFilterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1344FF',
  },
  tagBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tagBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagChipActive: {
    backgroundColor: '#1344FF',
    borderColor: '#1344FF',
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1344FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 99,
  },
  mapFloatingButton: {
    position: 'absolute',
    bottom: 26,
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 98,
  },
  mapFloatingButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // 모달 / 바텀시트 스타일
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  bottomSheetBody: {
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#F0F4FF',
    borderColor: '#1344FF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#1344FF',
    fontWeight: 'bold',
  },
  bottomSheetFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1344FF',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // 지도 모달 스타일
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mapModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  mapModalCloseButton: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapView: {
    flex: 1,
    borderRadius: 0,
  },
});
