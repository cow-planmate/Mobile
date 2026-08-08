import { CreatePostPayload } from '../types';
import { textToBlocks } from './blocks';

export const parseFeedTags = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => (tag.startsWith('#') ? tag : `#${tag}`)),
    ),
  );

export function buildFeedUpdatePayload({
  title,
  content,
  tags,
  thumbnailUrl,
}: {
  title: string;
  content: string;
  tags: string;
  thumbnailUrl: string;
}): Partial<CreatePostPayload> {
  const contentText = content.trim() || title.trim();

  return {
    title: title.trim(),
    content: textToBlocks(contentText),
    contentText,
    thumbnailUrl: thumbnailUrl.trim() || null,
    tags: parseFeedTags(tags),
  };
}
