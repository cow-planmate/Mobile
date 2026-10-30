import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { ContentBlock } from '../types';
import { buildFeedImageUploadFile, FeedImageUploadFile } from './feedImage';

/** 한 번에 고를 수 있는 본문 사진 수. */
export const MAX_BODY_IMAGES = 10;

type PickedAsset = Parameters<typeof buildFeedImageUploadFile>[0];

/**
 * 고른 사진을 서버에 올리고 올라간 주소를 고른 순서대로 돌려준다.
 *
 * 한 장이라도 형식·크기가 맞지 않으면 아무것도 올리지 않고 그 이유를 돌려준다.
 * 올리는 도중 일부만 실패하면 올라간 것은 살려서 돌려주고 실패는 문구로 알린다.
 * 이미 올라간 사진을 버리면 서버에 고아로 남기 때문이다.
 */
export async function uploadBodyImages(
  assets: PickedAsset[],
  upload: (file: FeedImageUploadFile) => Promise<string>,
): Promise<{ urls: string[]; error?: string }> {
  const files: FeedImageUploadFile[] = [];
  for (const asset of assets) {
    const built = buildFeedImageUploadFile(asset);
    if ('error' in built) return { urls: [], error: built.error };
    files.push(built.file);
  }

  const settled = await Promise.allSettled(files.map(upload));
  const urls: string[] = [];
  let firstFailure: unknown;
  let failedCount = 0;
  settled.forEach(result => {
    if (result.status === 'fulfilled') {
      urls.push(result.value);
    } else {
      failedCount += 1;
      firstFailure ??= result.reason;
    }
  });

  if (failedCount === 0) return { urls };
  const reason = getBackendErrorMessage(firstFailure);
  return {
    urls,
    error:
      urls.length === 0
        ? reason
        : `사진 ${failedCount}장을 올리지 못했어요. ${reason}`,
  };
}

/** 본문 블록에 실린 사진 주소를 모두 모은다. */
export function collectImageUrls(blocks: ContentBlock[]): string[] {
  const urls: string[] = [];
  const walk = (nodes: ContentBlock[]) => {
    nodes.forEach(node => {
      const url = node?.props?.url;
      if (node?.type === 'image' && typeof url === 'string' && url) {
        urls.push(url);
      }
      if (Array.isArray(node?.children)) walk(node.children);
    });
  };
  walk(blocks);
  return urls;
}

/**
 * 이번 작성 중에 올린 본문 사진의 장부.
 *
 * 사진은 넣는 순간 서버에 올라가므로 등록하지 않고 나가거나 넣었다 지운 사진이
 * 서버에 남는다. 장부에 적어 두었다가 끝나는 자리에서 쓰이지 않은 것을 지운다.
 * 글을 수정할 때 원래 있던 사진은 올린 적이 없으니 여기에 오르지 않는다.
 */
export function createBodyImageTracker(
  deleteImage: (url: string) => Promise<void>,
) {
  const uploaded = new Set<string>();

  const remove = (urls: string[]) => {
    urls.forEach(url => {
      void deleteImage(url).catch(() => undefined);
    });
  };

  return {
    track(url: string) {
      uploaded.add(url);
    },
    /** 등록이 끝났다. 본문에 남은 사진은 글의 것이 되고 나머지는 지운다. */
    commit(keep: string[]) {
      const kept = new Set(keep);
      remove([...uploaded].filter(url => !kept.has(url)));
      uploaded.clear();
    },
    /** 등록하지 않고 나갔다. 올린 사진을 전부 지운다. */
    discardAll() {
      remove([...uploaded]);
      uploaded.clear();
    },
  };
}
