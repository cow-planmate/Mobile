import { CreatePostPayload, CommunityCategory } from '../types';
import { textToBlocks } from './blocks';

export function buildPostPayload({
  category,
  title,
  content,
  location,
}: {
  category: Exclude<CommunityCategory, 'feed'>;
  title: string;
  content: string;
  location: string;
}): CreatePostPayload {
  const payload: CreatePostPayload = {
    category,
    title: title.trim(),
    content: textToBlocks(content.trim()),
    contentText: content.trim(),
  };

  if (category === 'recommend') {
    payload.location = location.trim();
  }

  return payload;
}
