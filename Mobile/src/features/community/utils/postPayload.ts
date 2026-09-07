import { CreatePostPayload, CommunityCategory } from '../types';
import { textToBlocks } from './blocks';

export function buildPostPayload({
  category,
  title,
  content,
  location,
  rating,
}: {
  category: Exclude<CommunityCategory, 'feed'>;
  title: string;
  content: string;
  location: string;
  /** 0이면 고르지 않은 것 — 보내지 않는다 */
  rating?: number;
}): CreatePostPayload {
  const payload: CreatePostPayload = {
    category,
    title: title.trim(),
    content: textToBlocks(content.trim()),
    contentText: content.trim(),
  };

  if (category === 'recommend') {
    payload.location = location.trim();
    if (rating && rating > 0) {
      payload.rating = rating;
    }
  }

  return payload;
}
