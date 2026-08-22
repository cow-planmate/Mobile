import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
import Check from 'lucide-react-native/dist/esm/icons/check';
import Palette from 'lucide-react-native/dist/esm/icons/palette';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: '라이트 모드 ☀️',
    description: '눈이 편안하고 깔끔한 기본 테마',
    primaryColor: tokens.colors.primary,
  },
  {
    id: 'dark',
    name: '다크 모드 🌙',
    description: '어두운 곳에서 눈의 피로를 덜어주는 테마',
    primaryColor: tokens.colors.text,
  },
  {
    id: 'indigo',
    name: '클래식 인디고 🌌',
    description: '차분하고 지적인 느낌의 네이비 테마',
    primaryColor: '#5856D6',
  },
  {
    id: 'emerald',
    name: '프레시 에메랄드 🌿',
    description: '자연을 담은 듯 청량하고 눈이 편한 초록 테마',
    primaryColor: '#10B981',
  },
];

export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState('light');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectTheme = (id: string) => {
    setSelectedTheme(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>테마 설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introBox}>
          <Palette size={32} color={COLORS.primary} />
          <Text style={styles.introTitle}>나만의 취향저격 스타일</Text>
          <Text style={styles.introDesc}>
            플랜메이트의 인터페이스 색상을 취향에 맞게 바꿔보세요. 언제든지 변경할 수 있어요.
          </Text>
        </View>

        <View style={styles.listContainer}>
          {THEME_OPTIONS.map((item) => {
            const isSelected = selectedTheme === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isSelected && { borderColor: item.primaryColor },
                ]}
                onPress={() => handleSelectTheme(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: item.primaryColor },
                    ]}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View
                    style={[
                      styles.checkCircle,
                      { backgroundColor: item.primaryColor },
                    ]}
                  >
                    <Check size={14} color="#FFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor:
                THEME_OPTIONS.find((o) => o.id === selectedTheme)?.primaryColor ||
                COLORS.primary,
            },
          ]}
          onPress={handleBack}
        >
          <Text style={styles.applyButtonText}>테마 적용하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  headerSpacer: {
    width: 24,
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
  introBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: normalize(16),
    padding: normalize(20),
    marginBottom: normalize(24),
  },
  introTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: normalize(12),
    marginBottom: normalize(4),
  },
  introDesc: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(18),
  },
  listContainer: {
    gap: normalize(12),
    marginBottom: normalize(32),
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    marginRight: normalize(12),
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: normalize(2),
  },
  cardDesc: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    height: normalize(48),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
