import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, Sparkles } from 'lucide-react-native';
import { useAlert } from '../../../contexts/AlertContext';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

interface PreferenceOption {
  id: string;
  label: string;
  color: string;
  bgTint: string;
}

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: '1', label: '모던 블루 💙', color: '#1344FF', bgTint: '#E8EDFF' },
  { id: '2', label: '포레스트 그린 💚', color: '#10B981', bgTint: '#ECFDF5' },
  { id: '3', label: '스윗 핑크 💗', color: '#EC4899', bgTint: '#FDF2F8' },
  { id: '4', label: '선셋 오렌지 🧡', color: '#F97316', bgTint: '#FFF7ED' },
  { id: '5', label: '로열 퍼플 💜', color: '#8B5CF6', bgTint: '#F5F3FF' },
  { id: '6', label: '미니멀 그레이 🖤', color: '#4B5563', bgTint: '#F3F4F6' },
];

export default function ThemePreferenceScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [selectedIds, setSelectedIds] = useState<string[]>(['1']);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // 최소 한 개 선택 유지
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = () => {
    showAlert({
      title: '취향 저장 완료 🌟',
      message: '분석된 테마 선호 정보가 프로필에 업데이트되었습니다.',
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>테마 취향 분석</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Sparkles size={36} color="#E0A900" fill="#FFE082" />
          <Text style={styles.bannerTitle}>선호하는 색상을 선택해주세요</Text>
          <Text style={styles.bannerSubtitle}>
            고객님의 취향에 맞는 테마나 추천 여행 정보 카드를 우선적으로 구성하는데 활용됩니다.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>테마 색상 팔레트 (다중 선택)</Text>
        <View style={styles.grid}>
          {PREFERENCE_OPTIONS.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: option.bgTint },
                  isSelected && { borderColor: option.color, borderWidth: 2 },
                ]}
                onPress={() => handleToggleOption(option.id)}
                activeOpacity={0.8}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: option.color }]} />
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: option.color }]}>
                      <Check size={10} color="#FFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={[styles.optionLabel, { color: option.color }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>내 취향 분석 및 저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: normalize(4),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: normalize(20),
    paddingBottom: normalize(40),
  },
  banner: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: normalize(16),
    padding: normalize(20),
    marginBottom: normalize(28),
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  bannerTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#92400E',
    marginTop: normalize(12),
    marginBottom: normalize(4),
  },
  bannerSubtitle: {
    fontSize: normalize(12),
    color: '#B45309',
    textAlign: 'center',
    lineHeight: normalize(18),
  },
  sectionTitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.textLabel,
    marginBottom: normalize(12),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: normalize(12),
    marginBottom: normalize(32),
  },
  optionCard: {
    width: '48%',
    borderRadius: normalize(12),
    padding: normalize(16),
    justifyContent: 'space-between',
    height: normalize(100),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorIndicator: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
  },
  checkBadge: {
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginTop: normalize(12),
  },
  saveButton: {
    height: normalize(48),
    backgroundColor: COLORS.primary,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
