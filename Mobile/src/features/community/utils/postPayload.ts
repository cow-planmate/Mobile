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
  /** 메이트 찾기를 없앤 뒤로는 만들 때 넘어오지 않는다. 옛 글 수정에서만 쓰인다. */
  maxParticipants?: string;
  location: string;
}): CreatePostPayload {
  const payload: CreatePostPayload = {
    category,
    title: title.trim(),
    content: textToBlocks(content.trim()),
    contentText: content.trim(),
  };

  if (category === 'mate') {
    const raw = maxParticipants ?? '';
    const parsed = Number(raw.trim());
    payload.maxParticipants =
      raw.trim() && Number.isFinite(parsed) && parsed > 0
        ? Math.floor(parsed)
        : null;
  }

  if (category === 'recommend') {
    payload.location = location.trim();
  }

  return payload;
}
