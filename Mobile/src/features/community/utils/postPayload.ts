import { CreatePostPayload, CommunityCategory } from '../types';
import { textToBlocks } from './blocks';

export function buildPostPayload({
  category,
  title,
  content,
  maxParticipants,
  location,
}: {
  category: Exclude<CommunityCategory, 'feed'>;
  title: string;
  content: string;
  maxParticipants: string;
  location: string;
}): CreatePostPayload {
  const payload: CreatePostPayload = {
    category,
    title: title.trim(),
    content: textToBlocks(content.trim()),
    contentText: content.trim(),
  };

  if (category === 'mate') {
    const parsed = Number(maxParticipants.trim());
    payload.maxParticipants =
      maxParticipants.trim() && Number.isFinite(parsed) && parsed > 0
        ? Math.floor(parsed)
        : null;
  }

  if (category === 'recommend') {
    payload.location = location.trim();
  }

  return payload;
}
