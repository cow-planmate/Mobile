import { CreatePostPayload } from '../types';
import { textToBlocks } from './blocks';

export function buildFeedUpdatePayload({
  title,
  content,
  thumbnailUrl,
}: {
  title: string;
  content: string;
  thumbnailUrl: string;
}): Partial<CreatePostPayload> {
  const contentText = content.trim() || title.trim();

  return {
    title: title.trim(),
    content: textToBlocks(contentText),
    contentText,
    thumbnailUrl: thumbnailUrl.trim() || null,
  };
}
