import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Map from 'lucide-react-native/dist/esm/icons/map';
import Bed from 'lucide-react-native/dist/esm/icons/bed';
import UtensilsCrossed from 'lucide-react-native/dist/esm/icons/utensils-crossed';
import X from 'lucide-react-native/dist/esm/icons/x';
import { PreferredThemeVO, changePreferredThemes } from '../../api/themes';
import ThemeSelector, { ThemeSelectorResult, CATEGORY_MAP } from './ThemeSelector';
import { styles, COLORS } from './UpdateThemeModal.styles';
import { useAlert } from '../../contexts/AlertContext';
import { resolveApiUrl } from '../../utils/apiUrl';
import { useQueryClient } from '@tanstack/react-query';
import { tokens } from '../../theme/tokens';
import {
  USER_PROFILE_QUERY_KEY,
  UserProfile,
} from '../../hooks/useUserProfile';

const CATEGORY_ICONS: Record<number, React.ReactNode> = {
  0: <Map size={16} color={tokens.colors.textSecondary} strokeWidth={1.5} />,
  1: <Bed size={16} color={tokens.colors.textSecondary} strokeWidth={1.5} />,
  2: <UtensilsCrossed size={16} color={tokens.colors.textSecondary} strokeWidth={1.5} />,
};

const CATEGORY_NAMES: Record<number, string> = {
  0: '관광지',
  1: '숙소',
  2: '식당',
};

type UpdateThemeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  const [saving, setSaving] = useState(false);

  const fetchUserThemes = useCallback(async () => {
    try {
      setLoading(true);

      const cachedThemes = queryClient.getQueryData<UserProfile>(
        USER_PROFILE_QUERY_KEY,
      )?.preferredThemes;
      const themes: PreferredThemeVO[] =
        cachedThemes ??
        (await axios.get(resolveApiUrl('/api/user/profile'))).data
          .preferredThemes ??
        [];

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
      console.error('Failed to fetch user themes:', error);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    if (visible) {
      fetchUserThemes();
    }
  }, [visible, fetchUserThemes]);

  const handleSelectorComplete = (selections: ThemeSelectorResult) => {
    setSelectedThemes(selections);
    setSelectorVisible(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const themeIdsByCategoryId: Record<number, number[]> = {};
      for (const catId of [0, 1, 2]) {
        themeIdsByCategoryId[catId] =
          selectedThemes[catId]?.map(t => t.preferredThemeId) || [];
      }
      await changePreferredThemes(themeIdsByCategoryId);

      onConfirm();
    } catch (error) {
      console.error('Failed to save themes:', error);
      showAlert({ title: '오류', message: '선호 테마를 저장하지 못했어요.' });
    } finally {
      setSaving(false);
    }
  };

  const hasSelections = Object.values(selectedThemes).some(
    arr => arr.length > 0,
  );

  const groupedForDisplay = [0, 1, 2]
    .map(catId => ({
      catId,
      icon: CATEGORY_ICONS[catId],
      name: CATEGORY_NAMES[catId],
      themes: selectedThemes[catId] || [],
    }))
    .filter(g => g.themes.length > 0);

  return (
    <>
      <Modal
        visible={visible && !isSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>선호 테마 변경</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                <X size={20} color={tokens.colors.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <>
                {hasSelections ? (
                  <ScrollView
                    style={styles.summaryScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.summaryContainer}>
                      {groupedForDisplay.map(group => (
                        <View key={group.catId} style={styles.categoryGroup}>
                          <View style={styles.categoryHeader}>
                            {group.icon}
                            <Text style={styles.categoryName}>
                              {group.name}
                            </Text>
                          </View>
                          <View style={styles.themeChips}>
                            {group.themes.map(theme => (
                              <View
                                key={theme.preferredThemeId}
                                style={styles.themeChip}
                              >
                                <Text style={styles.themeChipText}>
                                  {theme.preferredThemeName}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>선택된 테마가 없어요</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    hasSelections && styles.selectButtonActive,
                  ]}
                  onPress={() => setSelectorVisible(true)}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      hasSelections && styles.selectButtonTextActive,
                    ]}
                  >
                    {hasSelections
                      ? '선호테마 재선택하기'
                      : '선호테마 선택하기'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.confirmFooter}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.7}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>완료</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ThemeSelector
        visible={isSelectorVisible}
        onClose={() => setSelectorVisible(false)}
        onComplete={handleSelectorComplete}
        initialSelections={selectedThemes}
      />
    </>
  );
}
