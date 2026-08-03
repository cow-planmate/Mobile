import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CornerDownRight, MessageCircle, Send } from 'lucide-react-native';
import { theme } from '../../../theme/theme';
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
import UserAvatar from './UserAvatar';
import LevelBadge from './LevelBadge';

interface CommentSectionProps {
  postId: number;
  commentCount: number;
}

/** 댓글 목록 + 작성/수정/삭제. 대댓글은 한 단계까지만 지원한다. */
export default function CommentSection({
  postId,
  commentCount,
}: CommentSectionProps) {
  const { showAlert } = useAlert();
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: commentsPage, isLoading } = useComments(postId);
  const createComment = useCreateComment(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);

  /**
   * 평면 목록(parentId 포함)을 부모-대댓글로 묶는다.
   * 부모가 현재 페이지에 없으면 고아가 되지 않도록 최상위로 올린다.
   */
  const { topLevel, repliesByParent } = useMemo(() => {
    const items = commentsPage?.items ?? [];
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
  }, [commentsPage]);

  const requireLogin = () => {
    showAlert({ title: '로그인 필요', message: '로그인 후 이용할 수 있어요.' });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return requireLogin();
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      await createComment.mutateAsync({ content: trimmed });
      setContent('');
    } catch (error) {
      showAlert({
        title: '댓글 등록 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    try {
      await createComment.mutateAsync({ content: trimmed, parentId });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      showAlert({
        title: '답글 등록 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleEditSubmit = async (commentId: number) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    try {
      await updateComment.mutateAsync({ commentId, content: trimmed });
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      showAlert({
        title: '댓글 수정 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleDelete = (commentId: number, hasReplies: boolean) => {
    showAlert({
      title: '댓글 삭제',
      message: hasReplies
        ? '댓글을 삭제할까요? 답글도 함께 삭제됩니다.'
        : '댓글을 삭제할까요?',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment.mutateAsync(commentId);
            } catch (error) {
              showAlert({
                title: '댓글 삭제 실패',
                message: getBackendErrorMessage(error),
                type: 'error',
              });
            }
          },
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
              color={theme.colors.textTertiary}
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
              <LevelBadge level={comment.level} />
              <Text style={styles.commentTime}>{comment.createdAt}</Text>
            </View>

            {isEditing ? (
              <View>
                <TextInput
                  style={styles.editInput}
                  value={editContent}
                  onChangeText={setEditContent}
                  multiline
                  autoFocus
                />
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() => handleEditSubmit(comment.id)}
                    hitSlop={6}
                  >
                    <Text style={styles.actionPrimary}>저장</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditingId(null)}
                    hitSlop={6}
                  >
                    <Text style={styles.action}>취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                        setReplyContent('');
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
                          setEditContent(comment.content);
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
          <View style={styles.replyInputRow}>
            <TextInput
              style={styles.input}
              placeholder="답글을 입력하세요"
              placeholderTextColor={theme.colors.textTertiary}
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleReplySubmit(comment.id)}
              disabled={createComment.isPending}
            >
              <Send size={normalize(15)} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {replies.map(reply => renderComment(reply, true))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={normalize(16)} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>댓글 {commentCount}</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={
            isLoggedIn ? '댓글을 입력하세요' : '로그인 후 댓글을 쓸 수 있어요'
          }
          placeholderTextColor={theme.colors.textTertiary}
          value={content}
          onChangeText={setContent}
          editable={isLoggedIn}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !isLoggedIn && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isLoggedIn || createComment.isPending}
        >
          <Send size={normalize(15)} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loading}
          color={theme.colors.primary}
        />
      ) : topLevel.length === 0 ? (
        <Text style={styles.empty}>첫 댓글을 남겨보세요</Text>
      ) : (
        topLevel.map(comment => renderComment(comment, false))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: normalize(6),
    borderTopColor: theme.colors.surface,
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
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text,
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
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  editInput: {
    minHeight: normalize(38),
    marginTop: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(8),
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },

  comment: {
    flexDirection: 'row',
    gap: normalize(8),
    paddingVertical: normalize(10),
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
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
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textTertiary,
  },
  commentText: {
    fontSize: normalize(13),
    lineHeight: normalize(19),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLabel,
  },
  commentActions: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(6),
  },
  action: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  actionPrimary: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.primary,
  },
  actionDanger: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.danger,
  },

  loading: {
    marginVertical: normalize(20),
  },
  empty: {
    textAlign: 'center',
    marginVertical: normalize(24),
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textTertiary,
  },
});
