import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Images,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
  useEditorContent,
  type ToolbarItem,
} from '@10play/tentap-editor';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/**
 * 여행기 본문 편집기.
 *
 * 누른 서식이 기호가 아니라 결과로 바로 보여야 해서 tentap(WebView TipTap)을 쓴다.
 * 서버는 BlockNote 블록으로 저장하므로 바깥에서 richText.ts로 HTML을 옮긴다.
 *
 * 단추는 그 블록으로 되돌릴 수 있는 것만 둔다. 여기 없는 서식을 열어 두면
 * 저장할 때 조용히 사라진다.
 */
const PRIMARY_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBold(),
    active: ({ editorState }) => editorState.isBoldActive,
    disabled: ({ editorState }) => !editorState.canToggleBold,
    image: () => Images.bold,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleItalic(),
    active: ({ editorState }) => editorState.isItalicActive,
    disabled: ({ editorState }) => !editorState.canToggleItalic,
    image: () => Images.italic,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleUnderline(),
    active: ({ editorState }) => editorState.isUnderlineActive,
    disabled: ({ editorState }) => !editorState.canToggleUnderline,
    image: () => Images.underline,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBulletList(),
    active: ({ editorState }) => editorState.isBulletListActive,
    disabled: ({ editorState }) => !editorState.canToggleBulletList,
    image: () => Images.bulletList,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.undo(),
    active: () => false,
    disabled: ({ editorState }) => !editorState.canUndo,
    image: () => Images.undo,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.redo(),
    active: () => false,
    disabled: ({ editorState }) => !editorState.canRedo,
    image: () => Images.redo,
  },
];

const MORE_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleHeading(1),
    active: ({ editorState }) => editorState.headingLevel === 1,
    disabled: ({ editorState }) => !editorState.canToggleHeading,
    image: () => Images.h1,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleHeading(2),
    active: ({ editorState }) => editorState.headingLevel === 2,
    disabled: ({ editorState }) => !editorState.canToggleHeading,
    image: () => Images.h2,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleOrderedList(),
    active: ({ editorState }) => editorState.isOrderedListActive,
    disabled: ({ editorState }) => !editorState.canToggleOrderedList,
    image: () => Images.orderedList,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleTaskList(),
    active: ({ editorState }) => editorState.isTaskListActive,
    disabled: ({ editorState }) => !editorState.canToggleTaskList,
    image: () => Images.checkList,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBlockquote(),
    active: ({ editorState }) => editorState.isBlockquoteActive,
    disabled: ({ editorState }) => !editorState.canToggleBlockquote,
    image: () => Images.quote,
  },
];

interface Props {
  initialHtml: string;
  editable: boolean;
  placeholder: string;
  onChangeHtml: (html: string) => void;
}

export default function FeedEditor({
  initialHtml,
  editable,
  placeholder,
  onChangeHtml,
}: Props) {
  const [showMoreTools, setShowMoreTools] = useState(false);
  /**
   * setPlaceholder는 WebView가 뜬 뒤에야 먹어서 그전까지 기본 문구가 보인다.
   * 확장 설정으로 넘기면 본문이 실리기 전에 박히므로 처음부터 우리 문구가 나온다.
   * 같은 이름이 뒤에 오면 앞 설정을 덮어쓴다(RichText/utils.js).
   */
  const bridgeExtensions = useMemo(
    () => [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({ placeholder }),
    ],
    [placeholder],
  );

  const editor = useEditorBridge({
    avoidIosKeyboard: true,
    // 본문이 늘어나는 만큼 WebView도 늘어나야 바깥 스크롤 하나로 읽힌다.
    dynamicHeight: true,
    editable,
    initialContent: initialHtml,
    bridgeExtensions,
  });
  const html = useEditorContent(editor, { type: 'html' });
  const toolbarItems = useMemo(
    () =>
      showMoreTools
        ? [...PRIMARY_TOOLBAR_ITEMS, ...MORE_TOOLBAR_ITEMS]
        : PRIMARY_TOOLBAR_ITEMS,
    [showMoreTools],
  );

  useEffect(() => {
    if (typeof html === 'string') onChangeHtml(html);
  }, [html, onChangeHtml]);

  return (
    <View>
      <View style={styles.toolbarHeading}>
        <Text style={styles.toolbarLabel}>본문 서식</Text>
        <TouchableOpacity
          onPress={() => setShowMoreTools(value => !value)}
          accessibilityRole="button"
          accessibilityLabel={
            showMoreTools ? '서식 도구 접기' : '서식 도구 더보기'
          }
          hitSlop={8}
        >
          <Text style={styles.moreButtonText}>
            {showMoreTools ? '접기' : '더보기'}
          </Text>
        </TouchableOpacity>
      </View>
      <Toolbar editor={editor} items={toolbarItems} hidden={false} />
      <View style={styles.surface} accessibilityLabel="여행기 본문 편집기">
        <RichText editor={editor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarHeading: {
    minHeight: normalize(36),
    paddingHorizontal: normalize(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLabel: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textMuted,
  },
  moreButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  surface: {
    marginTop: normalize(8),
    minHeight: normalize(180),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    overflow: 'hidden',
  },
});
