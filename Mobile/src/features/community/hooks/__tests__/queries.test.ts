import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useCreateComment,
  useCreatePost,
  useDeletePost,
  useUpdateComment,
  useUpdatePost,
} from '../queries';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

const invalidateQueries = jest.fn(() => Promise.resolve());
const removeQueries = jest.fn();
const queryClient = { invalidateQueries, removeQueries };
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

const mutationOptions = () => mockUseMutation.mock.calls.at(-1)[0];

describe('community mutation cache invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(queryClient);
  });

  it('게시글 생성 후 목록, 내 활동, 지역 집계를 갱신한다', () => {
    useCreatePost();
    mutationOptions().onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'posts'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'me'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'feed-regions'],
    });
  });

  it('게시글 수정 후 상세, 내 활동, 지역 집계를 갱신한다', () => {
    useUpdatePost(7);
    mutationOptions().onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'post', '7'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'me'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'feed-regions'],
    });
  });

  it('게시글 삭제 후 더 이상 유효하지 않은 상세 캐시를 제거한다', () => {
    useDeletePost();
    mutationOptions().onSuccess(undefined, 7);

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'post', '7'],
    });
  });

  it.each([useCreateComment, useUpdateComment])(
    '댓글 변경 후 내 활동 캐시를 갱신한다',
    useCommentMutation => {
      useCommentMutation(7);
      mutationOptions().onSuccess();

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['community', 'me'],
      });
    },
  );
});
