import { CreatePostPayload, CommunityCategory } from '../types';
import { textToBlocks } from './blocks';

export function buildPostPayload({
  category,
  title,
  content,
}: {
  category: Exclude<CommunityCategory, 'feed'>;
  title: string;
  content: string;
}): CreatePostPayload {
  return {
    category,
    title: title.trim(),
    content: textToBlocks(content.trim()),
    contentText: content.trim(),
  };
}
