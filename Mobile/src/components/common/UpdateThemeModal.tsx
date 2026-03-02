import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { Map, Bed, UtensilsCrossed } from 'lucide-react-native';
import { PreferredThemeVO, changePreferredThemes } from '../../api/themes';
import ThemeSelector, { ThemeSelectorResult } from './ThemeSelector';
import { styles, COLORS } from './UpdateThemeModal.styles';

const CATEGORY_ICONS: Record<number, React.ReactNode> = {
  0: <Map size={16} color="#6B7280" strokeWidth={1.5} />,
  1: <Bed size={16} color="#6B7280" strokeWidth={1.5} />,
  2: <UtensilsCrossed size={16} color="#6B7280" strokeWidth={1.5} />,
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
  const [currentThemes, setCurrentThemes] = useState<PreferredThemeVO[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<ThemeSelectorResult>({});
  const [isSelectorVisible, setSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUserThemes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`);
      const themes: PreferredThemeVO[] = response.data.preferredThemes || [];
      setCurrentThemes(themes);

      // 카테고리별로 그룹화
      const grouped: ThemeSelectorResult = {};
      themes.forEach(t => {
        if (!grouped[t.preferredThemeCategoryId]) {
          grouped[t.preferredThemeCategoryId] = [];
        }
        grouped[t.preferredThemeCategoryId].push(t);
      });
      setSelectedThemes(grouped);
    } catch (error) {
      console.error('Failed to fetch user themes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      // 카테고리별로 PATCH 요청
      const categoryIds = Object.keys(selectedThemes).map(Number);
      for (const catId of categoryIds) {
        const themeIds =
          selectedThemes[catId]?.map(t => t.preferredThemeId) || [];
        await changePreferredThemes(catId, themeIds);
      }

      // 선택되지 않은 카테고리도 빈 배열로 전송 (기존 선택 제거)
      for (const catId of [0, 1, 2]) {
        if (!categoryIds.includes(catId)) {
          await changePreferredThemes(catId, []);
        }
      }

      onConfirm();
    } catch (error) {
      console.error('Failed to save themes:', error);
      Alert.alert('오류', '선호 테마 저장에 실패했습니다.');
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
            <Text style={styles.title}>선호 테마 변경</Text>

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
                    <Text style={styles.emptyText}>선택된 테마가 없습니다</Text>
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

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleSave}
                    disabled={saving}
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
