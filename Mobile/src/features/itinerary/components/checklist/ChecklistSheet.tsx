import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  CHECKLIST_CONTENT_MAX_LENGTH,
  ChecklistItem,
  ChecklistScope,
} from '../../../../api/checklist';
import {
  getChecklistErrorMessage,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useEditChecklistItemContent,
  usePlanChecklists,
  useToggleChecklistItem,
} from '../../hooks/useChecklistQueries';
import { normalize } from '../../../../utils/normalize';
import { styles, COLORS } from './ChecklistSheet.styles';

const SCOPE_TABS: { scope: ChecklistScope; label: string }[] = [
  { scope: 'shared', label: '공동 준비' },
  { scope: 'personal', label: '나의 준비' },
];

const SCOPE_EMPTY_TEXT: Record<ChecklistScope, string> = {
  shared: '함께 준비할 것을 적어 두면\n같은 일정을 보는 사람에게도 보입니다.',
  personal: '나만 보는 준비물 목록입니다.\n첫 항목을 추가해 보세요.',
};

interface ChecklistSheetProps {
  visible: boolean;
  onClose: () => void;
  planId: string | null | undefined;
}

/**
 * 준비물 체크리스트 시트.
 *
 * 공동(일정 참여자 공용)과 개인(나만 보기) 목록을 탭으로 나눠 보여준다.
 * 목록은 시트를 열었을 때만 조회하고, 닫으면 다음 열람 시 다시 가져온다 —
 * 서버가 실시간 편집 세션에 REST 변경을 push하지 않아 열어 둔 채로는 다른
 * 참여자의 변경을 알 수 없기 때문이다.
 *
 * 순서 변경 API는 준비되어 있으나 드래그 정렬 UI는 이 범위 밖이라 넣지 않았다.
 */
export default function ChecklistSheet({
  visible,
  onClose,
  planId,
}: ChecklistSheetProps) {
  const [scope, setScope] = useState<ChecklistScope>('shared');
  const [draft, setDraft] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const { sharedItems, personalItems, counts, isLoading, isError, refetch } =
    usePlanChecklists(planId, visible);

  const createItem = useCreateChecklistItem(planId, scope);
  const editContent = useEditChecklistItemContent(planId, scope);
  const toggleItem = useToggleChecklistItem(planId, scope);
  const deleteItem = useDeleteChecklistItem(planId, scope);

  const items = scope === 'shared' ? sharedItems : personalItems;
  const count = counts[scope];
  const progress = count.total > 0 ? count.done / count.total : 0;

  const isMutating =
    createItem.isPending || editContent.isPending || deleteItem.isPending;

  const showError = useCallback((error: unknown) => {
    Toast.show({
      type: 'error',
      text1: getChecklistErrorMessage(error),
      position: 'bottom',
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingItemId(null);
    setEditingText('');
  }, []);

  const handleChangeScope = useCallback(
    (next: ChecklistScope) => {
      cancelEditing();
      setScope(next);
    },
    [cancelEditing],
  );

  const handleAdd = useCallback(() => {
    const content = draft.trim();
    if (!content || createItem.isPending) {
      return;
    }

    createItem.mutate(content, {
      onSuccess: () => setDraft(''),
      onError: showError,
    });
  }, [createItem, draft, showError]);

  const handleToggle = useCallback(
    (item: ChecklistItem) => {
      toggleItem.mutate(
        { itemId: item.itemId, isChecked: !item.isChecked },
        { onError: showError },
      );
    },
    [showError, toggleItem],
  );

  const handleSubmitEdit = useCallback(() => {
    if (editingItemId == null) {
      return;
    }

    const content = editingText.trim();
    if (!content) {
      cancelEditing();
      return;
    }

    editContent.mutate(
      { itemId: editingItemId, content },
      { onSuccess: cancelEditing, onError: showError },
    );
  }, [cancelEditing, editContent, editingItemId, editingText, showError]);

  const handleDelete = useCallback(
    (itemId: number) => {
      if (editingItemId === itemId) {
        cancelEditing();
      }
      deleteItem.mutate(itemId, { onError: showError });
    },
    [cancelEditing, deleteItem, editingItemId, showError],
  );

  const canSubmitDraft = draft.trim().length > 0 && !createItem.isPending;

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.stateText}>준비물을 불러오는 중…</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            준비물을 불러오지 못했어요.{'\n'}잠시 후 다시 시도해 주세요.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void refetch()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryLabel}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{SCOPE_EMPTY_TEXT[scope]}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {items.map(item => {
          const isEditing = editingItemId === item.itemId;

          return (
            <View key={item.itemId} style={styles.itemRow}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.itemEditInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    onSubmitEditing={handleSubmitEdit}
                    maxLength={CHECKLIST_CONTENT_MAX_LENGTH}
                    returnKeyType="done"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={handleSubmitEdit}
                    disabled={editContent.isPending}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <Check size={normalize(18)} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={cancelEditing}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <X size={normalize(18)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.itemToggle}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.7}
                  >
                    {item.isChecked ? (
                      <CheckCircle2
                        size={normalize(18)}
                        color={COLORS.primary}
                      />
                    ) : (
                      <Circle
                        size={normalize(18)}
                        color={COLORS.borderStrong}
                      />
                    )}
                    <Text
                      style={[
                        styles.itemText,
                        item.isChecked && styles.itemTextChecked,
                      ]}
                    >
                      {item.content}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => {
                      setEditingItemId(item.itemId);
                      setEditingText(item.content);
                    }}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <Pencil size={normalize(16)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => handleDelete(item.itemId)}
                    disabled={isMutating}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={normalize(16)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }, [
    cancelEditing,
    editContent.isPending,
    editingItemId,
    editingText,
    handleDelete,
    handleSubmitEdit,
    handleToggle,
    isError,
    isLoading,
    isMutating,
    items,
    refetch,
    scope,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>준비물 체크리스트</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <X size={normalize(18)} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            {SCOPE_TABS.map(tab => {
              const isActive = tab.scope === scope;

              return (
                <TouchableOpacity
                  key={tab.scope}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => handleChangeScope(tab.scope)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive,
                    ]}
                  >
                    {tab.label} {counts[tab.scope].done}/
                    {counts[tab.scope].total}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressCaption}>준비 완료</Text>
              <Text style={styles.progressCount}>
                {count.done}/{count.total}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>

          {body}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleAdd}
              placeholder="준비물을 입력하세요"
              placeholderTextColor={COLORS.textTertiary}
              maxLength={CHECKLIST_CONTENT_MAX_LENGTH}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !canSubmitDraft && styles.addButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!canSubmitDraft}
              activeOpacity={0.8}
            >
              {createItem.isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Check size={normalize(20)} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
