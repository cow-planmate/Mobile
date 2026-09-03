import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import ArrowRight from 'lucide-react-native/dist/esm/icons/arrow-right';
import { PreferredThemeVO, getPreferredThemes } from '../../api/themes';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';
import { useAlert } from '../../contexts/AlertContext';

const MAX_PER_CATEGORY = 5;

export const CATEGORY_MAP: Record<
  PreferredThemeVO['category'],
  { id: number; name: string }
> = {
  ATTRACTION: { id: 0, name: '관광지' },
  ACCOMMODATION: { id: 1, name: '숙소' },
  RESTAURANT: { id: 2, name: '식당' },
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

/**
 * 취향 키워드를 갈래마다 한 단계씩 고르는 팝업.
 *
 * 가입 직후(AppNavigator)와 마이페이지의 선호 테마 변경, 두 곳에서 열린다.
 * 뒤쪽은 이미 공통 껍데기 위에 있으므로 여기도 같은 껍데기를 쓴다 — 그러지
 * 않으면 팝업 안에서 모양이 다른 팝업이 또 뜬다.
 */
export default function ThemeSelector({
  visible,
  onClose,
  onComplete,
  initialSelections,
}: ThemeSelectorProps) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [themesByCategory, setThemesByCategory] = useState<
    PreferredThemeVO[][]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>[]>([]);

  const fetchThemes = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await getPreferredThemes(signal);
      if (signal?.aborted) return;
      const themes = response.preferredThemes;

      const categoryMap = new Map<
        number,
        { name: string; themes: PreferredThemeVO[] }
      >();

      themes.forEach(theme => {
        const catInfo = CATEGORY_MAP[theme.category] || { id: 99, name: '기타' };
        const catId = catInfo.id;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            name: catInfo.name,
            themes: [],
          });
        }
        categoryMap.get(catId)!.themes.push(theme);
      });

      const sortedKeys = Array.from(categoryMap.keys()).sort((a, b) => a - b);
      const cats = sortedKeys.map(k => ({
        id: k,
        name: categoryMap.get(k)!.name,
      }));
      const grouped = sortedKeys.map(k => categoryMap.get(k)!.themes);

      setCategories(cats);
      setThemesByCategory(grouped);

      const initSets = sortedKeys.map(catId => {
        if (initialSelections && initialSelections[catId]) {
          return new Set(initialSelections[catId].map(t => t.preferredThemeId));
        }
        return new Set<number>();
      });
      setSelectedIds(initSets);
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Failed to fetch themes:', error);
      showAlert({
        title: '오류',
        message: '테마 목록을 불러오지 못했어요.',
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [initialSelections, showAlert]);

  useEffect(() => {
    const controller = new AbortController();
    if (visible) {
      setCurrentStep(0);
      void fetchThemes(controller.signal);
    }
    return () => controller.abort();
  }, [visible, fetchThemes]);

  const handleToggle = (themeId: number) => {
    setSelectedIds(prev => {
      const updated = prev.map(set => new Set(set));
      const currentSet = updated[currentStep];

      if (currentSet.has(themeId)) {
        currentSet.delete(themeId);
      } else {
        if (currentSet.size >= MAX_PER_CATEGORY) {
          showAlert({
            title: '알림',
            message: `최대 ${MAX_PER_CATEGORY}개까지 선택할 수 있어요.`,
          });
          return prev;
        }
        currentSet.add(themeId);
      }
      return updated;
    });
  };

  const buildResult = (sets: Set<number>[]): ThemeSelectorResult => {
    const result: ThemeSelectorResult = {};
    categories.forEach((cat, idx) => {
      result[cat.id] = themesByCategory[idx].filter(t =>
        sets[idx].has(t.preferredThemeId),
      );
    });
    return result;
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(buildResult(selectedIds));
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const updated = selectedIds.map(set => new Set(set));
    updated[currentStep] = new Set();
    setSelectedIds(updated);
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(buildResult(updated));
    }
  };

  const currentThemes = themesByCategory[currentStep] || [];
  const currentSelected = selectedIds[currentStep] || new Set();
  const categoryName = categories[currentStep]?.name || '';
  const isLastStep = currentStep === categories.length - 1;

  return (
    <PopupModal
      visible={visible}
      title={categoryName ? `좋아하는 ${categoryName} 키워드` : '취향 고르기'}
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          {/* 고르지 않고 넘어가는 길은 눈에 띄되 손이 먼저 가지는 않게 글자만 둔다. */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="이 갈래 건너뛰기"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>

          <View style={styles.navButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePrev}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="이전 갈래로"
              >
                <Text style={styles.prevButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, loading && styles.nextButtonOff]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isLastStep ? '선택 완료' : '다음 갈래로'}
              accessibilityState={{ disabled: loading }}
            >
              <Text
                style={[styles.nextButtonText, loading && styles.nextTextOff]}
              >
                {isLastStep ? '완료' : '다음'}
              </Text>
              {isLastStep ? null : (
                <ArrowRight
                  size={normalize(15)}
                  color={tokens.colors.white}
                  strokeWidth={2.2}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <View style={styles.body}>
          {/* 몇 단계 중 어디인지와 몇 개를 골랐는지를 한 줄에 나란히 둔다. */}
          <View style={styles.meta}>
            <Text style={styles.metaStep}>
              {currentStep + 1} / {categories.length}
            </Text>
            <Text style={styles.metaCount}>
              {currentSelected.size}/{MAX_PER_CATEGORY} 선택됨
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {currentThemes.map(theme => {
              const isSelected = currentSelected.has(theme.preferredThemeId);
              return (
                <TouchableOpacity
                  key={theme.preferredThemeId}
                  style={[styles.chip, isSelected && styles.chipOn]}
                  onPress={() => handleToggle(theme.preferredThemeId)}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={theme.preferredThemeName}
                >
                  <Text
                    style={[styles.chipText, isSelected && styles.chipTextOn]}
                  >
                    {theme.preferredThemeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  body: {
    flexShrink: 1,
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  loading: {
    paddingVertical: normalize(48),
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: normalize(10),
  },
  metaStep: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  metaCount: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
    paddingBottom: normalize(4),
  },
  chip: {
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(9),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  chipOn: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  chipText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  chipTextOn: {
    color: tokens.colors.white,
    fontFamily: tokens.fontFamily.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(8),
  },
  skipButton: {
    height: normalize(48),
    justifyContent: 'center',
    paddingRight: normalize(8),
  },
  skipButtonText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  prevButton: {
    height: normalize(48),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  nextButton: {
    height: normalize(48),
    minWidth: normalize(96),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
  },
  nextButtonOff: {
    backgroundColor: tokens.colors.disabled,
  },
  // 회색 바탕에 흰 글자는 읽히지 않는다. 잠겼을 때는 글자도 함께 낮춘다.
  nextTextOff: {
    color: tokens.colors.textTertiary,
  },
  nextButtonText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
