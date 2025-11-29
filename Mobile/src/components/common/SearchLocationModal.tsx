import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

const { width } = Dimensions.get('window');

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

// [출발지] 리스트 아이템
function DepartureItem({
  item,
  onSelect,
}: {
  item: DepartureVO;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity style={styles.resultItem} onPress={onSelect}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.departureName}</Text>
        <Text style={styles.resultAddress}>{item.departureAddress}</Text>
      </View>
    </TouchableOpacity>
  );
}

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

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setDepartureList([]);
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
    onSelect(name);
    onClose();
  };

  const isDeparture = fieldToUpdate === 'departure';
  const title = isDeparture ? '출발지 검색' : '여행지 선택';

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalView}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 출발지 검색창 (여행지 선택 시에는 숨김) */}
          {isDeparture && (
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="출발지(역, 터미널, 주소 등) 입력"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                returnKeyType="search"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>
          )}

          {/* 로딩 표시 */}
          {isLoading && isDeparture && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}

          {/* 컨텐츠 영역 */}
          <View style={styles.contentContainer}>
            {isDeparture ? (
              // [출발지] 검색 결과 리스트
              <FlatList
                data={departureList}
                keyExtractor={(item, index) => item.placeId || index.toString()}
                renderItem={({ item }) => (
                  <DepartureItem
                    item={item}
                    onSelect={() => handleSelect(item.departureName)}
                  />
                )}
                ListEmptyComponent={
                  !isLoading && searchQuery.length > 1 ? (
                    <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                  ) : null
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              />
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    height: 600,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 22,
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.placeholder,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  loaderContainer: {
    paddingVertical: 20,
  },
  // 출발지 리스트 스타일
  resultItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultInfo: {
    flexDirection: 'column',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  // 여행지 그리드 스타일
  gridScrollContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.8,
    marginBottom: SPACING,
    marginRight: SPACING, // 3열 배치 시 오른쪽 여백
    borderRadius: 12,
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
    borderRadius: 12,
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14, // 텍스트 길이 증가에 따른 폰트 크기 조정
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 4, // 텍스트 줄바꿈 방지 여백
  },
  gridTextDark: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.placeholder,
    marginTop: 40,
    fontSize: 16,
  },
});
