import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PreferredThemeVO, getPreferredThemes } from '../../api/themes';
import { styles, COLORS } from './ThemeSelector.styles';

const MAX_PER_CATEGORY = 5;

const CATEGORY_TITLES: Record<number, string> = {
  0: '관광지',
  1: '숙소',
  2: '식당',
};

export interface ThemeSelectorResult {
  [categoryId: number]: PreferredThemeVO[];
}

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (selections: ThemeSelectorResult) => void;
  initialSelections?: ThemeSelectorResult;
}

export default function ThemeSelector({
  visible,
  onClose,
  onComplete,
  initialSelections,
}: ThemeSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [themesByCategory, setThemesByCategory] = useState<
    PreferredThemeVO[][]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>[]>([]);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPreferredThemes();
      const themes = response.preferredThemes;

      // 카테고리별로 그룹화
      const categoryMap = new Map<
        number,
        { name: string; themes: PreferredThemeVO[] }
      >();

      themes.forEach(theme => {
        const catId = theme.preferredThemeCategoryId;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            name:
              theme.preferredThemeCategoryName ||
              CATEGORY_TITLES[catId] ||
              `카테고리 ${catId}`,
            themes: [],
          });
        }
        categoryMap.get(catId)!.themes.push(theme);
      });

      // 카테고리 ID 순으로 정렬
      const sortedKeys = Array.from(categoryMap.keys()).sort((a, b) => a - b);
      const cats = sortedKeys.map(k => ({
        id: k,
        name: categoryMap.get(k)!.name,
      }));
      const grouped = sortedKeys.map(k => categoryMap.get(k)!.themes);

      setCategories(cats);
      setThemesByCategory(grouped);

      // 초기 선택값 설정
      const initSets = sortedKeys.map(catId => {
        if (initialSelections && initialSelections[catId]) {
          return new Set(initialSelections[catId].map(t => t.preferredThemeId));
        }
        return new Set<number>();
      });
      setSelectedIds(initSets);
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      Alert.alert('오류', '테마 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [initialSelections]);

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      fetchThemes();
    }
  }, [visible, fetchThemes]);

  const handleToggle = (themeId: number) => {
    setSelectedIds(prev => {
      const updated = prev.map(set => new Set(set));
      const currentSet = updated[currentStep];

      if (currentSet.has(themeId)) {
        currentSet.delete(themeId);
      } else {
        if (currentSet.size >= MAX_PER_CATEGORY) {
          Alert.alert(
            '알림',
            `최대 ${MAX_PER_CATEGORY}개까지 선택할 수 있습니다.`,
          );
          return prev;
        }
        currentSet.add(themeId);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계 - 완료
      const result: ThemeSelectorResult = {};
      categories.forEach((cat, idx) => {
        const themes = themesByCategory[idx].filter(t =>
          selectedIds[idx].has(t.preferredThemeId),
        );
        result[cat.id] = themes;
      });
      onComplete(result);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // 현재 카테고리 선택 초기화 후 다음으로
    setSelectedIds(prev => {
      const updated = prev.map(set => new Set(set));
      updated[currentStep] = new Set();
      return updated;
    });
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const result: ThemeSelectorResult = {};
      categories.forEach((cat, idx) => {
        const themes = themesByCategory[idx].filter(t =>
          selectedIds[idx].has(t.preferredThemeId),
        );
        result[cat.id] = themes;
      });
      onComplete(result);
    }
  };

  const currentThemes = themesByCategory[currentStep] || [];
  const currentSelected = selectedIds[currentStep] || new Set();
  const categoryName = categories[currentStep]?.name || '';
  const isLastStep = currentStep === categories.length - 1;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              <Text style={styles.title}>
                좋아하는 {categoryName} 키워드를{'\n'}선택해주세요!
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContent}
              >
                <View style={styles.keywordGrid}>
                  {currentThemes.map(theme => {
                    const isSelected = currentSelected.has(
                      theme.preferredThemeId,
                    );
                    return (
                      <TouchableOpacity
                        key={theme.preferredThemeId}
                        style={[
                          styles.keywordButton,
                          isSelected && styles.keywordButtonSelected,
                        ]}
                        onPress={() => handleToggle(theme.preferredThemeId)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.keywordText,
                            isSelected && styles.keywordTextSelected,
                          ]}
                        >
                          {theme.preferredThemeName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.counter}>
                {currentSelected.size}/{MAX_PER_CATEGORY} 선택됨
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipButtonText}>건너뛰기</Text>
                </TouchableOpacity>

                <View style={styles.navButtons}>
                  {currentStep > 0 && (
                    <TouchableOpacity
                      style={styles.prevButton}
                      onPress={handlePrev}
                    >
                      <Text style={styles.prevButtonText}>이전</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                  >
                    <Text style={styles.nextButtonText}>
                      {isLastStep ? '완료' : '다음'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
