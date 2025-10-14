// src/components/common/SearchLocationModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
  gray: '#E5E5EA',
};

const DUMMY_LOCATIONS = [
  '서울',
  '부산',
  '인천',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '수원',
  '제주',
  '강릉',
  '속초',
  '여수',
  '전주',
  '경주',
  '포항',
  '안동',
  '목포',
  '순천',
  '진주',
  '창원',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
  fieldToUpdate: 'departure' | 'destination';
  currentValue: string;
};

const LocationSearchResultItem = ({
  item,
  onSelect,
}: {
  item: string;
  onSelect: () => void;
}) => (
  <TouchableOpacity style={styles.resultItem} onPress={onSelect}>
    <Text style={styles.resultText}>{item}</Text>
  </TouchableOpacity>
);

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
  fieldToUpdate,
  currentValue,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchQuery(currentValue);
    }
  }, [visible, currentValue]);

  const title = fieldToUpdate === 'departure' ? '출발지 검색' : '여행지 검색';
  const placeholder =
    fieldToUpdate === 'departure'
      ? '출발지를 입력해주세요'
      : '여행지를 입력해주세요';

  const filteredLocations =
    searchQuery.trim() === ''
      ? []
      : DUMMY_LOCATIONS.filter(location =>
          location.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  const handleSelectLocation = (location: string) => {
    onSelect(location);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
            />
          </View>

          <View style={styles.contentContainer}>
            {filteredLocations.length > 0 ? (
              <FlatList
                data={filteredLocations}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <LocationSearchResultItem
                    item={item}
                    onSelect={() => handleSelectLocation(item)}
                  />
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📍</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery.trim() === ''
                    ? '위치를 검색해보세요.'
                    : '검색 결과가 없습니다.'}
                </Text>
              </View>
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
    height: 450,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: COLORS.placeholder,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: 20,
    marginTop: 15,
  },
  resultItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.text,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 40,
    color: COLORS.gray,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.placeholder,
  },
});
