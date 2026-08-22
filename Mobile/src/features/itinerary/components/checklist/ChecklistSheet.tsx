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
import Check from 'lucide-react-native/dist/esm/icons/check';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import Circle from 'lucide-react-native/dist/esm/icons/circle';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import RefreshCw from 'lucide-react-native/dist/esm/icons/refresh-cw';
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
import { normalize } from '../../../../utils/normalize';
import { useAlert } from '../../../../contexts/AlertContext';
import { styles, COLORS } from './ChecklistSheet.styles';

const SCOPE_TABS: { scope: ChecklistScope; label: string }[] = [
  { scope: 'shared', label: '공동 준비' },
  { scope: 'personal', label: '나의 준비' },
];

const SCOPE_EMPTY_TEXT: Record<ChecklistScope, string> = {
  shared: '함께 준비할 것을 적어 두면\n같은 일정을 보는 사람에게도 보여요.',
  personal: '나만 보는 준비물 목록이에요.\n첫 항목을 추가해 보세요.',
};

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

  const {
    sharedItems,
    personalItems,
    counts,
    isRealtime,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePlanChecklists(planId, visible);

  const createItem = useCreateChecklistItem(planId, scope);
  const editContent = useEditChecklistItemContent(planId, scope);
  const toggleItem = useToggleChecklistItem(planId, scope);
  const deleteItem = useDeleteChecklistItem(planId, scope);
  const reorderItems = useReorderChecklistItems(planId, scope);

  const items = scope === 'shared' ? sharedItems : personalItems;
  const count = counts[scope];
  const progress = count.total > 0 ? count.done / count.total : 0;

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

  // 삭제 버튼이 이동 화살표와 같은 모양으로 붙어 있어 오탭이 나기 쉽고,
  // 공유 체크리스트는 되돌리기 없이 협업자 화면에서도 즉시 사라진다.
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

  const handleMove = useCallback(
    (itemId: number, direction: -1 | 1) => {
      if (reorderItems.isPending) {
        return;
      }

      const currentIndex = items.findIndex(item => item.itemId === itemId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
        return;
      }

      const itemIds = items.map(item => item.itemId);
      [itemIds[currentIndex], itemIds[nextIndex]] = [
        itemIds[nextIndex],
        itemIds[currentIndex],
      ];
      reorderItems.mutate(itemIds, { onError: showError });
    },
    [items, reorderItems, showError],
  );

  const handleRefresh = useCallback(() => {
    refetch().catch(() => undefined);
  }, [refetch]);

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
          <Text style={styles.stateText}>{SCOPE_EMPTY_TEXT[scope]}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item, index) => {
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
                    accessibilityRole="button"
                    accessibilityLabel={"수정 저장"}
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
                    accessibilityLabel={"수정 취소"}
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
                    accessibilityState={{ disabled: isMutating }}
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
                    accessibilityRole="button"
                    accessibilityLabel={`${item.content} 수정`}
                  >
                    <Pencil size={normalize(16)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => handleMove(item.itemId, -1)}
                    disabled={isMutating || index === 0}
                    accessibilityLabel={`${item.content} 위로 이동`}
                    hitSlop={6}
                    activeOpacity={0.7}
                    accessibilityState={{ disabled: isMutating || index === 0 }}
                  >
                    <ChevronUp size={normalize(16)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => handleMove(item.itemId, 1)}
                    disabled={isMutating || index === items.length - 1}
                    accessibilityLabel={`${item.content} 아래로 이동`}
                    hitSlop={6}
                    activeOpacity={0.7}
                    accessibilityState={{ disabled: isMutating || index === items.length - 1 }}
                  >
                    <ChevronDown size={normalize(16)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemAction}
                    onPress={() => handleDelete(item.itemId, item.content)}
                    disabled={isMutating}
                    accessibilityLabel={`${item.content} 삭제`}
                    hitSlop={6}
                    activeOpacity={0.7}
                    accessibilityState={{ disabled: isMutating }}
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
    handleMove,
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
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleRefresh}
                disabled={isFetching || isMutating}
                accessibilityLabel="체크리스트 새로고침"
                activeOpacity={0.7}
                hitSlop={8}
                accessibilityState={{ disabled: isFetching || isMutating }}
              >
                {isFetching ? (
                  <ActivityIndicator size="small" color={COLORS.textTertiary} />
                ) : (
                  <RefreshCw size={normalize(18)} color={COLORS.textTertiary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={"닫기"}
              >
                <X size={normalize(18)} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
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

          {scope === 'shared' && !isRealtime && (
            <Text style={styles.syncHint}>
              실시간 연결이 아니라 변경이 바로 전달되지 않아요. 새로고침으로 최신
              목록을 확인해 주세요.
            </Text>
          )}

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
              accessibilityState={{ disabled: !canSubmitDraft }}
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
