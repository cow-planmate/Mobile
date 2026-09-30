import { CommunityComment } from '../../types';
import { mergeCommentPages } from '../commentPages';

const createComment = (id: number): CommunityComment => ({
  id,
  postId: 1,
  userId: 'user-1',
  author: '테스터',
  level: 1,
  content: `댓글 ${id}`,
  createdAt: '방금 전',
  createdAtIso: '2026-01-01T00:00:00.000Z',
});

describe('mergeCommentPages', () => {
  it('페이지 순서대로 댓글을 합칩니다', () => {
    expect(
      mergeCommentPages([
        {
          items: [createComment(1), createComment(2)],
          page: 0,
          size: 2,
          totalElements: 3,
          totalPages: 2,
        },
        {
          items: [createComment(3)],
          page: 1,
          size: 2,
          totalElements: 3,
          totalPages: 2,
        },
      ]).map(comment => comment.id),
    ).toEqual([1, 2, 3]);
  });

  it('페이지 경계에 중복된 댓글은 한 번만 표시합니다', () => {
    expect(
      mergeCommentPages([
        {
          items: [createComment(1), createComment(2)],
          page: 0,
          size: 2,
          totalElements: 3,
          totalPages: 2,
        },
        {
          items: [createComment(2), createComment(3)],
          page: 1,
          size: 2,
          totalElements: 3,
          totalPages: 2,
        },
      ]).map(comment => comment.id),
    ).toEqual([1, 2, 3]);
  });
});
