import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Check from 'lucide-react-native/dist/esm/icons/check';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import Trash2 from 'lucide-react-native/dist/esm/icons/trash-2';
import X from 'lucide-react-native/dist/esm/icons/x';
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
  useReorderChecklistItems,
  useToggleChecklistItem,
} from '../../hooks/useChecklistQueries';
import ChecklistPopup from './ChecklistPopup';
import ChecklistDragList from './ChecklistDragList';
import { normalize } from '../../../../utils/normalize';
import { useAlert } from '../../../../contexts/AlertContext';
import { styles, COLORS, DANGER } from './ChecklistSheet.styles';

const SCOPE_TABS: { scope: ChecklistScope; label: string; hint: string }[] = [
  {
    scope: 'shared',
    label: '공동 준비',
    hint: '여행 멤버 모두가 함께 관리해요.',
  },
  {
    scope: 'personal',
    label: '개인 준비',
    hint: '나에게만 보이는 개인 목록이에요.',
  },
];

// 무엇이 공동이고 무엇이 개인인지는 탭 밑 한 줄이 이미 말한다. 비었을 때는
// 다음에 할 일만 남긴다.
const EMPTY_TITLE = '아직 준비 항목이 없어요';
const EMPTY_HINT = '첫 번째 여행 준비를 추가해 보세요.';

interface ChecklistSheetProps {
  visible: boolean;
  onClose: () => void;
  planId: string | null | undefined;
}

export default function ChecklistSheet({
  visible,
  onClose,
  planId,
}: ChecklistSheetProps) {
  const [scope, setScope] = useState<ChecklistScope>('shared');
  const [draft, setDraft] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEditingItemId(null);
      setEditingText('');
    }
  }, [visible]);

  const { sharedItems, personalItems, counts, isLoading, isError, refetch } =
    usePlanChecklists(planId, visible);

  const createItem = useCreateChecklistItem(planId, scope);
  const editContent = useEditChecklistItemContent(planId, scope);
  const toggleItem = useToggleChecklistItem(planId, scope);
  const deleteItem = useDeleteChecklistItem(planId, scope);
  const reorderItems = useReorderChecklistItems(planId, scope);

  const items = scope === 'shared' ? sharedItems : personalItems;

  const isMutating =
    createItem.isPending ||
    editContent.isPending ||
    toggleItem.isPending ||
    deleteItem.isPending ||
    reorderItems.isPending;

  const { showAlert } = useAlert();

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

  const startEditing = useCallback((item: ChecklistItem) => {
    setEditingItemId(item.itemId);
    setEditingText(item.content);
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
    (itemId: number, content: string) => {
      showAlert({
        title: '항목 삭제',
        message: `'${content}'를 삭제할까요?`,
        type: 'confirm',
        buttons: [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              if (editingItemId === itemId) {
                cancelEditing();
              }
              deleteItem.mutate(itemId, { onError: showError });
            },
          },
        ],
      });
    },
    [cancelEditing, deleteItem, editingItemId, showAlert, showError],
  );

  const handleReorder = useCallback(
    (itemIds: number[]) => {
      if (isMutating) return;
      reorderItems.mutate(itemIds, { onError: showError });
    },
    [isMutating, reorderItems, showError],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch()
      .catch(() => undefined)
      .finally(() => setIsRefreshing(false));
  }, [refetch]);

  const canSubmitDraft = draft.trim().length > 0 && !createItem.isPending;

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.stateText}>준비 목록을 불러오는 중…</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>준비 목록을 불러오지 못했어요.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              refetch().catch(() => undefined);
            }}
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
          <Text style={styles.emptyTitle}>{EMPTY_TITLE}</Text>
          <Text style={styles.stateText}>{EMPTY_HINT}</Text>
        </View>
      );
    }

    return (
      <ChecklistDragList
        key={scope}
        items={items}
        disabled={isMutating || editingItemId !== null || !visible}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onReorder={handleReorder}
        renderItem={(item, handle, active) => {
          const isEditing = editingItemId === item.itemId;

          return (
            <View style={[styles.itemRow, active && styles.itemRowActive]}>
              {!isEditing && handle}
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.itemEditInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    onSubmitEditing={handleSubmitEdit}
                    accessibilityLabel="준비 내용 수정"
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
                    accessibilityRole="button"
                    accessibilityLabel="수정 저장"
                    accessibilityState={{ disabled: editContent.isPending }}
                  >
                    <Check size={normalize(18)} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={cancelEditing}
                    hitSlop={6}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="수정 취소"
                  >
                    <X size={normalize(18)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.itemToggle}
                    onPress={() => handleToggle(item)}
                    disabled={isMutating}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityLabel={item.content}
                    accessibilityState={{
                      disabled: isMutating,
                      checked: item.isChecked,
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.isChecked && styles.checkboxChecked,
                      ]}
                    >
                      {item.isChecked && (
                        <Check
                          size={normalize(13)}
                          color={COLORS.white}
                          strokeWidth={3}
                        />
                      )}
                    </View>
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
                    onPress={() => startEditing(item)}
                    disabled={isMutating}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.content} 수정`}
                    accessibilityState={{ disabled: isMutating }}
                  >
                    <Pencil size={normalize(17)} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => handleDelete(item.itemId, item.content)}
                    disabled={isMutating}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.content} 삭제`}
                    accessibilityState={{ disabled: isMutating }}
                  >
                    <Trash2 size={normalize(17)} color={DANGER} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        }}
      />
    );
  }, [
    cancelEditing,
    editContent.isPending,
    editingItemId,
    editingText,
    startEditing,
    handleDelete,
    handleReorder,
    scope,
    visible,
    handleRefresh,
    handleSubmitEdit,
    handleToggle,
    isError,
    isRefreshing,
    isLoading,
    isMutating,
    items,
    refetch,
  ]);

  return (
    <ChecklistPopup
      visible={visible}
      onClose={onClose}
      footer={
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleAdd}
            // 완료를 눌러도 키보드를 닫지 않아 연달아 담을 수 있게 한다.
            submitBehavior="submit"
            accessibilityLabel={`${
              SCOPE_TABS.find(tab => tab.scope === scope)?.label
            } 항목 추가`}
            placeholder={`${
              SCOPE_TABS.find(tab => tab.scope === scope)?.label
            } 항목 추가`}
            placeholderTextColor={COLORS.textSecondary}
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
            accessibilityRole="button"
            accessibilityLabel="항목 추가"
            accessibilityState={{ disabled: !canSubmitDraft }}
          >
            {createItem.isPending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Plus
                size={normalize(22)}
                color={canSubmitDraft ? COLORS.white : COLORS.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.tabRow}>
        {SCOPE_TABS.map(tab => {
          const isActive = tab.scope === scope;

          return (
            <TouchableOpacity
              key={tab.scope}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => handleChangeScope(tab.scope)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
              <Text style={styles.tabCount}>
                {counts[tab.scope].done}/{counts[tab.scope].total}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.scopeHint}>
        {SCOPE_TABS.find(tab => tab.scope === scope)?.hint}
      </Text>

      {body}
    </ChecklistPopup>
  );
}
