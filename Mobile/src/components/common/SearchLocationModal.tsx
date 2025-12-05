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

// 상위 지역 목록
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

// 하위 지역 매핑
const SUB_REGIONS: { [key: string]: string[] } = {
  서울특별시: [
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  부산광역시: [
    '강서구',
    '금정구',
    '기장군',
    '남구',
    '동구',
    '동래구',
    '부산진구',
    '북구',
    '사상구',
    '사하구',
    '서구',
    '수영구',
    '연제구',
    '영도구',
    '중구',
    '해운대구',
  ],
  대구광역시: [
    '남구',
    '달서구',
    '달성군',
    '동구',
    '북구',
    '서구',
    '수성구',
    '중구',
  ],
  인천광역시: [
    '강화군',
    '계양구',
    '남동구',
    '동구',
    '미추홀구',
    '부평구',
    '서구',
    '연수구',
    '옹진군',
    '중구',
  ],
  광주광역시: ['광산구', '남구', '동구', '북구', '서구'],
  대전광역시: ['대덕구', '동구', '서구', '유성구', '중구'],
  울산광역시: ['남구', '동구', '북구', '울주군', '중구'],
  세종특별자치시: ['세종시 전체'],
  경기도: [
    '가평군',
    '고양시',
    '과천시',
    '광명시',
    '광주시',
    '구리시',
    '김포시',
    '남양주시',
    '동두천시',
    '부천시',
    '성남시',
    '수원시',
    '시흥시',
    '안산시',
    '안성시',
    '안양시',
    '양평군',
    '양주시',
    '여주시',
    '연천군',
    '오산시',
    '용인시',
    '의왕시',
    '이천시',
    '파주시',
    '평택시',
    '포천시',
    '하남시',
    '화성시',
  ],
  강원특별자치도: [
    '강릉시',
    '고성군',
    '동해시',
    '삼척시',
    '속초시',
    '양구군',
    '양양군',
    '영월군',
    '원주시',
    '인제군',
    '정선군',
    '철원군',
    '춘천시',
    '태백시',
    '평창군',
    '홍천군',
    '횟천군',
  ],
  충청북도: [
    '괴산군',
    '단양군',
    '보은군',
    '영동군',
    '옥천군',
    '음성군',
    '제천시',
    '증평군',
    '진천군',
    '청주시',
    '충주시',
  ],
  충청남도: [
    '계룡시',
    '공주시',
    '금산군',
    '논산시',
    '당진시',
    '보령시',
    '부여군',
    '서천군',
    '아산시',
    '예산군',
    '천안시',
    '청양군',
    '태안군',
    '홍성군',
  ],
  전라북도: [
    '고창군',
    '군산시',
    '김제시',
    '남원시',
    '무주군',
    '부안군',
    '순창군',
    '완주군',
    '익산시',
    '임실군',
    '장수군',
    '전주시',
    '정읍시',
    '진안군',
  ],
  전라남도: [
    '강진군',
    '고흥군',
    '곡성군',
    '광양시',
    '구례군',
    '나주시',
    '담양군',
    '목포시',
    '무안군',
    '보성군',
    '순천시',
    '신안군',
    '여수시',
    '영광군',
    '영암군',
    '완도군',
    '장성군',
    '장흥군',
    '진도군',
    '함평군',
    '해남군',
    '화순군',
  ],
  경상북도: [
    '경산시',
    '경주시',
    '고령군',
    '구미시',
    '김천시',
    '문경시',
    '봉화군',
    '상주시',
    '성주군',
    '안동시',
    '영덕군',
    '영양군',
    '영천시',
    '예천군',
    '울릉군',
    '울진군',
    '의성군',
    '청도군',
    '청송군',
    '춘양군',
    '포항시',
  ],
  경상남도: [
    '거제시',
    '거창군',
    '고성군',
    '김해시',
    '남해군',
    '밀양시',
    '사천시',
    '산청군',
    '양산시',
    '의령군',
    '진주시',
    '창녕시',
    '창원시',
    '통영시',
    '하동군',
    '함안군',
    '함양군',
    '합천군',
  ],
  제주특별자치도: ['제주시', '서귀포시'],
};

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
  currentValue?: string;
};

const RECENT_SEARCHES_KEY = 'recentDepartureSearches';
const MAX_RECENT_SEARCHES = 3;

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
  fieldToUpdate,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departureList, setDepartureList] = useState<DepartureVO[]>([]);
  const [destinationList, setDestinationList] = useState<TravelVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedParentRegion, setSelectedParentRegion] = useState<
    string | null
  >(null);

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
      setSelectedParentRegion(null);
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

  // 상위 지역 클릭 핸들러
  const handleParentRegionClick = (regionName: string) => {
    setSelectedParentRegion(regionName);
  };

  // 하위 지역 선택 핸들러
  const handleSubRegionSelect = (parentRegion: string, subRegion: string) => {
    const fullLocation = `${parentRegion} ${subRegion}`;
    onSelect(fullLocation);
    onClose();
  };

  // 뒤로가기 (하위 지역 -> 상위 지역)
  const handleBackToParentRegions = () => {
    setSelectedParentRegion(null);
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
              // [여행지] 상위/하위 지역 리스트
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.destinationScrollContainer}
              >
                <View style={styles.destinationSectionContainer}>
                  {/* 헤더: 하위 지역 선택 시 뒤로가기 버튼 표시 */}
                  <View style={styles.sectionHeader}>
                    {selectedParentRegion ? (
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackToParentRegions}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.backButtonText}>‹</Text>
                        <Text style={styles.sectionTitle}>
                          {selectedParentRegion}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.sectionTitle}>
                        여행지를 선택해주세요
                      </Text>
                    )}
                  </View>
                  {isLoading ? (
                    <View style={styles.inlineLoaderContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.loaderText}>불러오는 중...</Text>
                    </View>
                  ) : selectedParentRegion ? (
                    // 하위 지역 리스트
                    <View style={styles.destinationListContainer}>
                      {(SUB_REGIONS[selectedParentRegion] || []).map(
                        (subRegion, index, arr) => (
                          <TouchableOpacity
                            key={subRegion}
                            style={[
                              styles.destinationItem,
                              index === arr.length - 1 &&
                                styles.destinationItemLast,
                            ]}
                            onPress={() =>
                              handleSubRegionSelect(
                                selectedParentRegion,
                                subRegion,
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <View style={styles.destinationInfo}>
                              <Text style={styles.destinationName}>
                                {subRegion}
                              </Text>
                            </View>
                            <Text style={styles.destinationArrow}>›</Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  ) : (
                    // 상위 지역 리스트
                    <View style={styles.destinationListContainer}>
                      {destinationList.map((item, index) => (
                        <TouchableOpacity
                          key={item.travelId}
                          style={[
                            styles.destinationItem,
                            index === destinationList.length - 1 &&
                              styles.destinationItemLast,
                          ]}
                          onPress={() =>
                            handleParentRegionClick(item.travelName)
                          }
                          activeOpacity={0.7}
                        >
                          <View style={styles.destinationInfo}>
                            <Text style={styles.destinationName}>
                              {item.travelName}
                            </Text>
                          </View>
                          <Text style={styles.destinationArrow}>›</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: normalize(24),
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: normalize(8),
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
  // 여행지 리스트 스타일
  destinationScrollContainer: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  destinationSectionContainer: {
    marginTop: normalize(4),
  },
  destinationListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  destinationItemLast: {
    borderBottomWidth: 0,
  },
  destinationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  destinationName: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: COLORS.text,
  },
  destinationArrow: {
    fontSize: normalize(22),
    color: COLORS.border,
    marginLeft: normalize(8),
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.placeholder,
    marginTop: normalize(40),
    fontSize: normalize(16),
  },
});
