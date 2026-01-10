import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

import { styles, COLORS } from './SearchLocationModal.styles';

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

interface DepartureVO {
  placeId: string;
  url: string;
  departureName: string;
  departureAddress: string;
}

interface TravelVO {
  travelId: number;
  travelName: string;
  travelCategoryId: number;
  travelCategoryName: string;
  // travelImg is not in the current spec but kept optional in case of future use or client-side mapping
  travelImg?: string;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string, id?: number) => void;
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
  const [rawDestinations, setRawDestinations] = useState<TravelVO[]>([]); // To store raw server data
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedParentRegion, setSelectedParentRegion] = useState<
    string | null
  >(null);

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

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/travel`);
      const serverData: TravelVO[] = response.data.travels || [];

      // 서버 데이터 확인용 로그
      if (__DEV__) {
        console.log('Fetched Travels:', serverData);
      }
      
      setRawDestinations(serverData);

      const formattedList = TARGET_REGIONS.map((regionName, index) => {
        // 서버 데이터에서 매칭되는 지역 찾기 (양방향 포함 관계 확인 및 공백 제거 비교)
        const matched = serverData.find(item => {
          const sName = item.travelName.replace(/\s+/g, '');
          const rName = regionName.replace(/\s+/g, '');
          return sName.includes(rName) || rName.includes(sName);
        });

        if (__DEV__ && !matched) {
          console.log(`Region unmatched: ${regionName}`);
        }

        return {
          travelId: matched ? matched.travelId : -1, // 매칭 안되면 -1
          travelName: regionName,
          travelImg: matched?.travelImg,
        };
      });
      
      // -1인 항목이 선택되면 문제가 될 수 있으므로 로깅
      if (__DEV__) {
        console.log('Mapped Destinations:', formattedList.map(d => `${d.travelName}:${d.travelId}`));
      }

      setDestinationList(formattedList);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);

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
      onSelect(name, undefined);
    } else {
      // 여행지 선택인 경우 destinationList에서 ID 찾기
      const matched = destinationList.find(d => d.travelName === name);
      if (matched && matched.travelId !== -1) {
        onSelect(name, matched.travelId);
      } else {
        // 매칭된 ID가 없거나 -1인 경우
        console.warn('Selected region has no valid ID:', name);
        // 필요시 에러 알림? 또는 일단 진행 (ID 0/undefined)
        onSelect(name, undefined);
      }
    }
    onClose();
  };

  const handleParentRegionClick = (regionName: string) => {
    setSelectedParentRegion(regionName);
  };

  const handleSubRegionSelect = (parentRegion: string, subRegion: string) => {
    const fullLocation = `${parentRegion} ${subRegion}`;
    
    // 1. Try to find match using subRegion name in rawDestinations
    let matched = rawDestinations.find(d => {
      const sName = d.travelName.replace(/\s+/g, '');
      const target = subRegion.replace(/\s+/g, '');
      return sName === target;
    });

    // 2. Fuzzy match subRegion
    if (!matched) {
      matched = rawDestinations.find(d => {
        const sName = d.travelName.replace(/\s+/g, '');
        const target = subRegion.replace(/\s+/g, '');
        return sName.includes(target) || target.includes(sName);
      });
    }

    // 3. Fallback: try to match parentRegion (e.g. for special cities like Sejong)
    if (!matched) {
      matched = rawDestinations.find(d => {
        const sName = d.travelName.replace(/\s+/g, '');
        const target = parentRegion.replace(/\s+/g, '');
        return sName.includes(target) || target.includes(sName);
      });
    }

    const travelId = matched ? matched.travelId : -1;

    if (__DEV__) {
       console.log(`Selection: ${fullLocation}, Mapped ID: ${travelId}, Matched Name: ${matched?.travelName}`);
    }
    
    onSelect(fullLocation, travelId);
    onClose();
  };

  const handleBackToParentRegions = () => {
    setSelectedParentRegion(null);
  };

  const isDeparture = fieldToUpdate === 'departure';
  const title = isDeparture ? '출발지 검색' : '여행지 선택';
  const subtitle = isDeparture ? '어디서 출발하시나요?' : '어디로 떠나볼까요?';

  const renderEmptyState = () => (
    <ScrollView
      style={styles.emptyStateContainer}
      showsVerticalScrollIndicator={false}
    >
      {}
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

      {}
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
          {}
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

          {}
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

          {}
          <View style={styles.contentContainer}>
            {isDeparture ? (
              !isLoading ? (
                renderEmptyState()
              ) : null
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.destinationScrollContainer}
              >
                <View style={styles.destinationSectionContainer}>
                  {}
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
                    <View style={styles.destinationListContainer}>
                      {destinationList.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.travelName}-${index}`}
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
