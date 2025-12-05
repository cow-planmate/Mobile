import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  ScrollView,
  Animated,
  PixelRatio,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

// [디자인 설정]
const COLUMN_COUNT = 3; // 3열 배치
const SPACING = 10; // 아이템 간 간격
const PADDING_HORIZONTAL = 20; // 전체 좌우 여백
// 아이템 너비 계산
const ITEM_WIDTH =
  (width - PADDING_HORIZONTAL * 2 - SPACING * (COLUMN_COUNT - 1)) /
  COLUMN_COUNT;

// [롤백] 표시할 지역 목록 (전체 이름 사용)
const TARGET_REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F7F8FA',
  darkGray: '#505050',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
  lightBlue: '#e6f0ff',
  iconBg: '#F5F7FF',
  shadow: '#1344FF',
};

interface DepartureVO {
  placeId: string;
  url: string;
  departureName: string;
  departureAddress: string;
}

interface TravelVO {
  travelId: number;
  travelName: string;
  travelImg?: string;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
  fieldToUpdate: 'departure' | 'destination';
  currentValue: string;
};

const RECENT_SEARCHES_KEY = 'recentDepartureSearches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
  fieldToUpdate,
  currentValue,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departureList, setDepartureList] = useState<DepartureVO[]>([]);
  const [destinationList, setDestinationList] = useState<TravelVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 최근 검색 불러오기
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // 최근 검색 저장
  const saveRecentSearch = async (place: string) => {
    try {
      const updated = [place, ...recentSearches.filter(p => p !== place)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // 최근 검색 삭제
  const removeRecentSearch = async (place: string) => {
    try {
      const updated = recentSearches.filter(p => p !== place);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setDepartureList([]);
      if (fieldToUpdate === 'departure') {
        loadRecentSearches();
      }
      if (fieldToUpdate === 'destination') {
        fetchDestinations();
      }
    }
  }, [visible, fieldToUpdate]);

  // 여행지 목록 매핑 및 로드
  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/travel`);
      const serverData: TravelVO[] = response.data.travels || [];

      const formattedList = TARGET_REGIONS.map((regionName, index) => {
        // 서버 데이터에서 해당 지역 이름이 포함된 항목 찾기
        const matched = serverData.find(item =>
          item.travelName.includes(regionName),
        );

        return {
          travelId: matched ? matched.travelId : index,
          travelName: regionName, // 전체 이름으로 표시
          travelImg: matched?.travelImg,
        };
      });

      setDestinationList(formattedList);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      // 실패 시 기본 목록 생성
      const fallbackList = TARGET_REGIONS.map((name, index) => ({
        travelId: index,
        travelName: name,
      }));
      setDestinationList(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };

  const searchDepartures = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/departure`, {
        departureQuery: query,
      });
      if (response.data && response.data.departures) {
        setDepartureList(response.data.departures);
      } else {
        setDepartureList([]);
      }
    } catch (error) {
      console.error('Departure search failed:', error);
      setDepartureList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fieldToUpdate === 'departure') {
      const timer = setTimeout(() => {
        if (searchQuery.trim().length > 1) {
          searchDepartures(searchQuery);
        } else {
          setDepartureList([]);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, fieldToUpdate]);

  const handleSelect = (name: string) => {
    if (isDeparture) {
      saveRecentSearch(name);
    }
    onSelect(name);
    onClose();
  };

  const isDeparture = fieldToUpdate === 'departure';
  const title = isDeparture ? '출발지 검색' : '여행지 선택';
  const subtitle = isDeparture ? '어디서 출발하시나요?' : '어디로 떠나볼까요?';

  // 빈 상태 컴포넌트 (최근 검색 + 인기 장소)
  const renderEmptyState = () => (
    <ScrollView
      style={styles.emptyStateContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 최근 검색 섹션 */}
      {recentSearches.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🕐</Text>
            <Text style={styles.sectionTitle}>최근 검색</Text>
          </View>
          <View style={styles.tagContainer}>
            {recentSearches.map((place, index) => (
              <View key={index} style={styles.tagWrapper}>
                <TouchableOpacity
                  style={styles.tagButton}
                  onPress={() => setSearchQuery(place)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{place}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tagRemoveButton}
                  onPress={() => removeRecentSearch(place)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 검색 결과 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📍</Text>
          <Text style={styles.sectionTitle}>검색 결과</Text>
        </View>
        {isLoading ? (
          <View style={styles.inlineLoaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>검색 중...</Text>
          </View>
        ) : departureList.length > 0 ? (
          departureList.map((item, index) => (
            <TouchableOpacity
              key={item.placeId || index}
              style={styles.resultItem}
              onPress={() => handleSelect(item.departureName)}
              activeOpacity={0.7}
            >
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.departureName}</Text>
                <Text style={styles.resultAddress} numberOfLines={1}>
                  {item.departureAddress}
                </Text>
              </View>
              <Text style={styles.resultArrow}>›</Text>
            </TouchableOpacity>
          ))
        ) : searchQuery.length > 1 ? (
          <View style={styles.inlineNoResultContainer}>
            <Text style={styles.noResultIconSmall}>🔍</Text>
            <Text style={styles.emptyHintText}>검색 결과가 없습니다</Text>
          </View>
        ) : (
          <Text style={styles.emptyHintText}>
            검색어를 입력하면 결과가 표시됩니다
          </Text>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={styles.modalView}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 출발지 검색창 (여행지 선택 시에는 숨김) */}
          {isDeparture && (
            <View style={styles.searchContainer}>
              <View style={styles.searchIconContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="역, 터미널, 주소 등을 검색해보세요"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                returnKeyType="search"
                placeholderTextColor={COLORS.placeholder}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 컨텐츠 영역 */}
          <View style={styles.contentContainer}>
            {isDeparture ? (
              // [출발지] 검색 결과를 포함한 통합 뷰
              !isLoading ? (
                renderEmptyState()
              ) : null
            ) : (
              // [여행지] 카드형 그리드 리스트
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridScrollContainer}
              >
                <View style={styles.gridContainer}>
                  {destinationList.map(item => (
                    <TouchableOpacity
                      key={item.travelId}
                      style={styles.gridItem}
                      onPress={() => handleSelect(item.travelName)}
                      activeOpacity={0.8}
                    >
                      {item.travelImg ? (
                        <ImageBackground
                          source={{ uri: item.travelImg }}
                          style={styles.gridImage}
                          imageStyle={{ borderRadius: 12 }}
                        >
                          <View style={styles.gridOverlay}>
                            <Text style={styles.gridText}>
                              {item.travelName}
                            </Text>
                          </View>
                        </ImageBackground>
                      ) : (
                        <View style={styles.gridPlaceholder}>
                          <Text style={styles.gridTextDark}>
                            {item.travelName}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '100%',
    height: height * 0.85,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: normalize(16),
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
    fontWeight: '400',
  },
  closeButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: normalize(16),
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(16),
    marginHorizontal: normalize(20),
    paddingHorizontal: normalize(4),
    height: normalize(56),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIconContainer: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  searchIcon: {
    fontSize: normalize(18),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    color: COLORS.text,
    height: '100%',
  },
  clearButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(4),
  },
  clearButtonText: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(16),
    gap: normalize(8),
  },
  loaderText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },
  resultListContainer: {
    paddingBottom: normalize(20),
  },
  // 출발지 리스트 스타일
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    marginHorizontal: normalize(4),
    marginVertical: normalize(4),
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: COLORS.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  resultIcon: {
    fontSize: normalize(18),
  },
  resultInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  resultName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: normalize(2),
  },
  resultAddress: {
    fontSize: normalize(12),
    color: COLORS.placeholder,
  },
  resultArrow: {
    fontSize: normalize(20),
    color: COLORS.border,
    marginLeft: normalize(8),
  },
  // 빈 상태 스타일
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  sectionContainer: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  sectionIcon: {
    fontSize: normalize(16),
    marginRight: normalize(8),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  tagButton: {
    paddingLeft: normalize(14),
    paddingRight: normalize(8),
    paddingVertical: normalize(10),
  },
  tagRemoveButton: {
    paddingRight: normalize(12),
    paddingLeft: normalize(4),
    paddingVertical: normalize(10),
  },
  tagRemoveText: {
    fontSize: normalize(12),
    color: COLORS.placeholder,
  },
  tagText: {
    fontSize: normalize(14),
    color: COLORS.primary,
    fontWeight: '500',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  popularTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  popularText: {
    fontSize: normalize(16),
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  popularSubText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },
  popularArrow: {
    fontSize: normalize(20),
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  emptyHintText: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingVertical: normalize(20),
  },
  inlineLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(20),
    gap: normalize(8),
  },
  inlineNoResultContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  noResultIconSmall: {
    fontSize: normalize(24),
    marginBottom: normalize(8),
    opacity: 0.5,
  },
  // 검색 결과 없음 스타일
  noResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: normalize(60),
  },
  noResultIcon: {
    fontSize: normalize(48),
    marginBottom: normalize(16),
    opacity: 0.5,
  },
  noResultTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  noResultSubtitle: {
    fontSize: normalize(14),
    color: COLORS.placeholder,
  },
  // 여행지 그리드 스타일
  gridScrollContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: normalize(20),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: normalize(4),
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.8,
    marginBottom: SPACING,
    marginRight: SPACING,
    borderRadius: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(12),
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: normalize(14),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: normalize(4),
  },
  gridTextDark: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: normalize(14),
    textAlign: 'center',
    paddingHorizontal: normalize(4),
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.placeholder,
    marginTop: normalize(40),
    fontSize: normalize(16),
  },
});
