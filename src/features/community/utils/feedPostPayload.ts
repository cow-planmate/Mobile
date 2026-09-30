import { ContentBlock, CreatePostPayload } from '../types';

export function buildFeedUpdatePayload({
  title,
  contentBlocks,
  contentText,
  thumbnailUrl,
}: {
  title: string;
  contentBlocks: ContentBlock[];
  contentText: string;
  thumbnailUrl: string;
}): Partial<CreatePostPayload> {
  return {
    title: title.trim(),
    content: contentBlocks,
    contentText: contentText.trim() || title.trim(),
    thumbnailUrl: thumbnailUrl.trim() || null,
  };
}
