import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import CornerDownRight from 'lucide-react-native/dist/esm/icons/corner-down-right';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
import Send from 'lucide-react-native/dist/esm/icons/send';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '../hooks/queries';
import { CommunityComment } from '../types';
import { mergeCommentPages } from '../utils/commentPages';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import UserAvatar from '../../../components/common/UserAvatar';

interface CommentSectionProps {
  postId: number;
  commentCount: number;
  /** 피드 게시글이면 /api/feed 계약을 탄다 (커뮤니티와 ID 체계가 다르다) */
  feed?: boolean;
}

interface CommentComposerProps {
  placeholder: string;
  editable?: boolean;
  submitting?: boolean;

  containerStyle?: StyleProp<ViewStyle>;

  onSubmit: (text: string) => Promise<boolean>;
}

const CommentComposer = React.memo(function CommentComposer({
  placeholder,
  editable = true,
  submitting = false,
  containerStyle,
  onSubmit,
}: CommentComposerProps) {
  const [text, setText] = useState('');

  const handlePress = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (await onSubmit(trimmed)) {
      setText('');
    }
  };

  return (
    <View style={containerStyle ?? styles.inputRow}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.textTertiary}
        value={text}
        onChangeText={setText}
        editable={editable}
        multiline
        accessibilityLabel={placeholder}
      />
      <TouchableOpacity
        style={[styles.sendButton, !editable && styles.sendButtonDisabled]}
        onPress={handlePress}
        disabled={!editable || submitting}
        accessibilityRole="button"
        accessibilityLabel="댓글 등록"
        hitSlop={8}
        accessibilityState={{ disabled: !editable || submitting }}
      >
        <Send size={normalize(15)} color={tokens.colors.white} />
      </TouchableOpacity>
    </View>
  );
});

interface CommentEditorProps {
  initialValue: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const CommentEditor = React.memo(function CommentEditor({
  initialValue,
  onSubmit,
  onCancel,
}: CommentEditorProps) {
  const [text, setText] = useState(initialValue);

  return (
    <View>
      <TextInput
        style={styles.editInput}
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        accessibilityLabel="댓글 수정"
      />
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => onSubmit(text)} hitSlop={6}>
          <Text style={styles.actionPrimary}>저장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} hitSlop={6}>
          <Text style={styles.action}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function CommentSection({
  postId,
  commentCount,
  feed = false,
}: CommentSectionProps) {
  const { showAlert } = useAlert();
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const commentsQuery = useComments(postId, 20, feed);
  const createComment = useCreateComment(postId, feed);
  const updateComment = useUpdateComment(postId, feed);
  const deleteComment = useDeleteComment(postId, feed);

  const { topLevel, repliesByParent } = useMemo(() => {
    const items = mergeCommentPages(commentsQuery.data?.pages);
    const ids = new Set(items.map(c => c.id));
    const top: CommunityComment[] = [];
    const byParent = new Map<number, CommunityComment[]>();

    items.forEach(comment => {
      if (comment.parentId != null && ids.has(comment.parentId)) {
        const list = byParent.get(comment.parentId) ?? [];
        list.push(comment);
        byParent.set(comment.parentId, list);
      } else {
        top.push(comment);
      }
    });

    return { topLevel: top, repliesByParent: byParent };
  }, [commentsQuery.data?.pages]);

  const requireLogin = useCallback(() => {
    showAlert({ title: '로그인 필요', message: '로그인 후 이용할 수 있어요.' });
  }, [showAlert]);

  const commentLock = useSubmitLock();
  const replyLock = useSubmitLock();
  const editLock = useSubmitLock();
  const deleteLock = useSubmitLock();

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!isLoggedIn) {
        requireLogin();
        return false;
      }

      const result = await commentLock.runExclusive(async () => {
        try {
          await createComment.mutateAsync({ content: text });
          return true;
        } catch (error) {
          showAlert({
            title: '댓글 등록 실패',
            message: getBackendErrorMessage(error),
            type: 'error',
          });
          return false;
        }
      });
      return result ?? false;
    },
    [commentLock, createComment, isLoggedIn, requireLogin, showAlert],
  );

  const handleReplySubmit = useCallback(
    async (parentId: number, text: string) => {
      const result = await replyLock.runExclusive(async () => {
        try {
          await createComment.mutateAsync({ content: text, parentId });
          setReplyingTo(null);
          return true;
        } catch (error) {
          showAlert({
            title: '답글 등록 실패',
            message: getBackendErrorMessage(error),
            type: 'error',
          });
          return false;
        }
      });
      return result ?? false;
    },
    [createComment, replyLock, showAlert],
  );

  const handleEditSubmit = async (commentId: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await editLock.runExclusive(async () => {
      try {
        await updateComment.mutateAsync({ commentId, content: trimmed });
        setEditingId(null);
      } catch (error) {
        showAlert({
          title: '댓글 수정 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });
  };

  const handleDelete = (commentId: number, hasReplies: boolean) => {
    showAlert({
      title: '댓글 삭제',
      message: hasReplies
        ? '댓글을 삭제할까요? 답글도 함께 삭제돼요.'
        : '댓글을 삭제할까요?',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () =>
            deleteLock.runExclusive(async () => {
              try {
                await deleteComment.mutateAsync(commentId);
              } catch (error) {
                showAlert({
                  title: '댓글 삭제 실패',
                  message: getBackendErrorMessage(error),
                  type: 'error',
                });
              }
            }),
        },
      ],
    });
  };

  const renderComment = (comment: CommunityComment, isReply: boolean) => {
    const isAuthor = user?.userId === comment.userId;
    const replies = repliesByParent.get(comment.id) ?? [];
    const isEditing = editingId === comment.id;

    return (
      <View key={comment.id}>
        <View style={[styles.comment, isReply && styles.commentReply]}>
          {isReply && (
            <CornerDownRight
              size={normalize(13)}
              color={tokens.colors.textTertiary}
              style={styles.replyIcon}
            />
          )}
          <UserAvatar
            name={comment.author}
            imageUrl={comment.authorImage}
            avatarHash={comment.authorAvatarHash}
            size={normalize(28)}
          />
          <View style={styles.commentBody}>
            <View style={styles.commentMeta}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentTime}>{comment.createdAt}</Text>
            </View>

            {isEditing ? (
              <CommentEditor
                initialValue={comment.content}
                onSubmit={text => handleEditSubmit(comment.id, text)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  {!isReply && isLoggedIn && (
                    <TouchableOpacity
                      onPress={() => {
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id,
                        );
                        setEditingId(null);
                      }}
                      hitSlop={6}
                    >
                      <Text style={styles.action}>답글</Text>
                    </TouchableOpacity>
                  )}
                  {isAuthor && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(comment.id);
                          setReplyingTo(null);
                        }}
                        hitSlop={6}
                      >
                        <Text style={styles.action}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(comment.id, replies.length > 0)
                        }
                        hitSlop={6}
                      >
                        <Text style={styles.actionDanger}>삭제</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {replyingTo === comment.id && (
          <CommentComposer
            placeholder="답글을 입력하세요"
            containerStyle={styles.replyInputRow}
            submitting={createComment.isPending || replyLock.isSubmitting}
            onSubmit={text => handleReplySubmit(comment.id, text)}
          />
        )}

        {replies.map(reply => renderComment(reply, true))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={normalize(16)} color={tokens.colors.primary} />
        <Text style={styles.headerTitle}>댓글 {commentCount.toLocaleString()}</Text>
      </View>

      <CommentComposer
        placeholder={
          isLoggedIn ? '댓글을 입력하세요' : '로그인 후 댓글을 쓸 수 있어요'
        }
        editable={isLoggedIn}
        submitting={createComment.isPending || commentLock.isSubmitting}
        onSubmit={handleSubmit}
      />

      {commentsQuery.isLoading ? (
        <ActivityIndicator
          style={styles.loading}
          color={tokens.colors.primary}
        />
      ) : topLevel.length === 0 ? (
        <Text style={styles.empty}>첫 댓글을 남겨보세요</Text>
      ) : (
        <>
          {topLevel.map(comment => renderComment(comment, false))}
          {commentsQuery.hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => void commentsQuery.fetchNextPage()}
              disabled={commentsQuery.isFetchingNextPage}
              accessibilityState={{ disabled: commentsQuery.isFetchingNextPage }}
            >
              {commentsQuery.isFetchingNextPage ? (
                <ActivityIndicator color={tokens.colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>댓글 더 보기</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: normalize(6),
    borderTopColor: tokens.colors.surface,
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(12),
  },
  headerTitle: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(8),
    marginBottom: normalize(16),
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(8),
    marginLeft: normalize(38),
    marginBottom: normalize(12),
  },
  input: {
    flex: 1,
    minHeight: normalize(38),
    maxHeight: normalize(110),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(9),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    textAlignVertical: 'top',
  },
  editInput: {
    minHeight: normalize(38),
    marginTop: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(8),
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: tokens.colors.disabled,
  },

  comment: {
    flexDirection: 'row',
    gap: normalize(8),
    paddingVertical: normalize(10),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  commentReply: {
    paddingLeft: normalize(22),
  },
  replyIcon: {
    marginTop: normalize(6),
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    marginBottom: normalize(3),
  },
  commentAuthor: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  commentTime: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  commentText: {
    fontSize: normalize(13),
    lineHeight: normalize(19),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  commentActions: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(6),
  },
  action: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  actionPrimary: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  actionDanger: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.tones.danger.fg,
  },

  loading: {
    marginVertical: normalize(20),
  },
  empty: {
    textAlign: 'center',
    marginVertical: normalize(24),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  loadMoreButton: {
    alignSelf: 'center',
    minWidth: normalize(112),
    minHeight: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(8),
    paddingHorizontal: normalize(14),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.surface,
  },
  loadMoreText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primary,
  },
});
