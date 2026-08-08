import { CommunityComment, PageData } from '../types';

export function mergeCommentPages(
  pages: PageData<CommunityComment>[] | undefined,
): CommunityComment[] {
  const commentIds = new Set<number>();

  return (pages ?? []).flatMap(page =>
    page.items.filter(comment => {
      if (commentIds.has(comment.id)) return false;
      commentIds.add(comment.id);
      return true;
    }),
  );
}
