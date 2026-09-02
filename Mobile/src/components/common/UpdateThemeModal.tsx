import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { PreferredThemeVO, changePreferredThemes } from '../../api/themes';
import ThemeSelector, { ThemeSelectorResult, CATEGORY_MAP } from './ThemeSelector';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { useAlert } from '../../contexts/AlertContext';
import { resolveApiUrl } from '../../utils/apiUrl';
import { useQueryClient } from '@tanstack/react-query';
import { tokens } from '../../theme/tokens';
import {
  USER_PROFILE_QUERY_KEY,
  UserProfile,
} from '../../hooks/useUserProfile';
import { useSubmitLock } from '../../hooks/useSubmitLock';

const CATEGORY_NAMES: Record<number, string> = {
  0: '관광지',
  1: '숙소',
  2: '식당',
};

type UpdateThemeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function UpdateThemeModal({
  visible,
  onClose,
  onConfirm,
}: UpdateThemeModalProps) {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const [selectedThemes, setSelectedThemes] = useState<ThemeSelectorResult>({});
  const [isSelectorVisible, setSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSubmitting: saving, runExclusive } = useSubmitLock();

  const fetchUserThemes = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const cachedThemes = queryClient.getQueryData<UserProfile>(
        USER_PROFILE_QUERY_KEY,
      )?.preferredThemes;
      const themes: PreferredThemeVO[] =
        cachedThemes ??
        (await axios.get(resolveApiUrl('/api/user/profile'), { signal })).data
          .preferredThemes ??
        [];

      if (signal?.aborted) return;

      const grouped: ThemeSelectorResult = {};
      themes.forEach(t => {
        const categoryId = CATEGORY_MAP[t.category]?.id;
        if (categoryId === undefined) return;
        if (!grouped[categoryId]) {
          grouped[categoryId] = [];
        }
        grouped[categoryId].push(t);
      });
      setSelectedThemes(grouped);
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Failed to fetch user themes:', error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const controller = new AbortController();
    if (visible) {
      void fetchUserThemes(controller.signal);
    }
    return () => controller.abort();
  }, [visible, fetchUserThemes]);

  const handleSelectorComplete = (selections: ThemeSelectorResult) => {
    setSelectedThemes(selections);
    setSelectorVisible(false);
  };

  const handleSave = () =>
    runExclusive(async () => {
      try {
        const themeIdsByCategoryId: Record<number, number[]> = {};
        for (const catId of [0, 1, 2]) {
          themeIdsByCategoryId[catId] =
            selectedThemes[catId]?.map(t => t.preferredThemeId) || [];
        }
        await changePreferredThemes(themeIdsByCategoryId);

        await onConfirm();
      } catch (error) {
        console.error('Failed to save themes:', error);
        showAlert({ title: '오류', message: '선호 테마를 저장하지 못했어요.' });
      }
    });

  const groupedForDisplay = [0, 1, 2]
    .map(catId => ({
      catId,
      name: CATEGORY_NAMES[catId],
      themes: selectedThemes[catId] || [],
    }))
    .filter(g => g.themes.length > 0);

  return (
    <>
      <PopupModal
        visible={visible && !isSelectorVisible}
        title="선호 테마 변경"
        onClose={onClose}
        footer={
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="선호 테마 저장"
            accessibilityState={{ disabled: saving }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={tokens.colors.white} />
            ) : (
              <Text style={styles.confirmText}>완료</Text>
            )}
          </TouchableOpacity>
        }
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={tokens.colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* 마이페이지의 여행 취향 줄과 같은 표기를 쓴다.
                같은 값을 한 곳은 알약으로, 한 곳은 글로 적으면 따로 보인다. */}
            {groupedForDisplay.length > 0 ? (
              groupedForDisplay.map(group => (
                <View key={group.catId} style={styles.row}>
                  <Text style={styles.category}>{group.name}</Text>
                  <Text style={styles.themes}>
                    {group.themes
                      .map(theme => theme.preferredThemeName)
                      .join(', ')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>아직 고른 테마가 없어요</Text>
            )}

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setSelectorVisible(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.selectButtonText}>
                {groupedForDisplay.length > 0 ? '다시 고르기' : '테마 고르기'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </PopupModal>

      <ThemeSelector
        visible={isSelectorVisible}
        onClose={() => setSelectorVisible(false)}
        onComplete={handleSelectorComplete}
        initialSelections={selectedThemes}
      />
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  loading: {
    paddingVertical: normalize(48),
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(12),
    paddingVertical: normalize(11),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  category: {
    width: normalize(50),
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  themes: {
    flex: 1,
    fontSize: normalize(13.5),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  empty: {
    paddingVertical: normalize(36),
    textAlign: 'center',
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  selectButton: {
    marginTop: normalize(14),
    height: normalize(44),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  confirmButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
