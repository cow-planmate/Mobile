import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { launchImageLibrary } from 'react-native-image-picker';
import ImagePlus from 'lucide-react-native/dist/esm/icons/image-plus';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { uploadCommunityImage } from '../services/communityApi';
import { MAX_BODY_IMAGES, uploadBodyImages } from '../utils/bodyImages';
import FeedLinkSheet from './FeedLinkSheet';

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
];

const HISTORY_TOOLBAR_ITEMS: ToolbarItem[] = [
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

interface LinkTarget {
  url: string;
  active: boolean;
}

/**
 * 편집기 쪽에서 글자를 새로 끼워 넣는 길이 없어 '선택한 글자에 링크 걸기'만 한다.
 * 그래서 글자를 고르지 않았고 링크 위도 아니면 누를 수 없게 둔다.
 */
const createLinkItem = (onOpen: (target: LinkTarget) => void): ToolbarItem => ({
  onPress:
    ({ editorState }) =>
    () =>
      onOpen({
        url: editorState.activeLink ?? '',
        active: editorState.isLinkActive,
      }),
  active: ({ editorState }) => editorState.isLinkActive,
  disabled: ({ editorState }) =>
    !editorState.canSetLink && !editorState.isLinkActive,
  image: () => Images.link,
});

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
  /** 본문에 넣으려고 서버에 올린 사진 하나마다 불린다. 안 쓰이게 된 사진을 지울 때 쓴다. */
  onImageUploaded: (url: string) => void;
}

export default function FeedEditor({
  initialHtml,
  editable,
  placeholder,
  onChangeHtml,
  onImageUploaded,
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
  const [linkSheet, setLinkSheet] = useState({
    visible: false,
    url: '',
    active: false,
  });
  const openLink = useCallback(
    (target: LinkTarget) => setLinkSheet({ visible: true, ...target }),
    [],
  );
  const closeLink = () => setLinkSheet(prev => ({ ...prev, visible: false }));
  const toolbarItems = useMemo(() => {
    const primary = [
      ...PRIMARY_TOOLBAR_ITEMS,
      createLinkItem(openLink),
      ...HISTORY_TOOLBAR_ITEMS,
    ];
    return showMoreTools ? [...primary, ...MORE_TOOLBAR_ITEMS] : primary;
  }, [showMoreTools, openLink]);

  useEffect(() => {
    if (typeof html === 'string') onChangeHtml(html);
  }, [html, onChangeHtml]);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handlePickImages = async () => {
    if (uploadingImages) return;
    setImageError('');
    try {
      const picked = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: MAX_BODY_IMAGES,
      });
      if (picked.didCancel) return;
      if (picked.errorCode) {
        throw new Error(picked.errorMessage || '이미지를 선택하지 못했어요.');
      }
      const assets = picked.assets ?? [];
      if (assets.length === 0 || !isMountedRef.current) return;

      setUploadingImages(true);
      const { urls, error } = await uploadBodyImages(
        assets,
        uploadCommunityImage,
      );
      // 올라간 사진은 화면을 떠났더라도 장부에 알려야 서버에서 지울 수 있다.
      urls.forEach(url => onImageUploaded(url));
      if (!isMountedRef.current) return;
      urls.forEach(url => editor.setImage(url));
      if (error) setImageError(error);
    } catch (e) {
      if (isMountedRef.current) setImageError(getBackendErrorMessage(e));
    } finally {
      if (isMountedRef.current) setUploadingImages(false);
    }
  };

  return (
    <View>
      <View style={styles.toolbarHeading}>
        <Text style={styles.toolbarLabel}>본문 서식</Text>
        <View style={styles.headingActions}>
          <TouchableOpacity
            onPress={handlePickImages}
            disabled={!editable || uploadingImages}
            style={[
              styles.photoButton,
              (!editable || uploadingImages) && styles.photoButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="사진 삽입"
            accessibilityState={{ disabled: !editable || uploadingImages }}
            hitSlop={8}
          >
            <ImagePlus size={normalize(15)} color={tokens.colors.textLabel} />
            <Text style={styles.photoButtonText}>
              {uploadingImages ? '불러오는 중' : '사진'}
            </Text>
          </TouchableOpacity>
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
      </View>
      {!!imageError && (
        <Text style={styles.imageError} accessibilityRole="alert">
          {imageError}
        </Text>
      )}
      <Toolbar editor={editor} items={toolbarItems} hidden={false} />
      <View style={styles.surface} accessibilityLabel="여행기 본문 편집기">
        <RichText editor={editor} />
      </View>
      <FeedLinkSheet
        visible={linkSheet.visible}
        initialUrl={linkSheet.url}
        onApply={url => {
          editor.setLink(url);
          closeLink();
        }}
        onRemove={
          linkSheet.active
            ? () => {
                editor.setLink('');
                closeLink();
              }
            : undefined
        }
        onClose={closeLink}
      />
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
  headingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(16),
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  photoButtonDisabled: {
    opacity: 0.4,
  },
  photoButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textLabel,
  },
  imageError: {
    paddingHorizontal: normalize(4),
    paddingBottom: normalize(6),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.tones.danger.fg,
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
