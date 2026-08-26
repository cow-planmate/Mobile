const MAX_FEED_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

interface FeedImageAsset {
  uri?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface FeedImageUploadFile {
  uri: string;
  type: string;
  name: string;
}

export function buildFeedImageUploadFile(
  asset: FeedImageAsset | undefined,
): { file: FeedImageUploadFile } | { error: string } {
  if (!asset?.uri) {
    return { error: '이미지 파일을 불러오지 못했어요.' };
  }
  if (!asset.type || !SUPPORTED_MIME_TYPES.has(asset.type)) {
    return { error: 'JPG, PNG, GIF, WebP 이미지만 등록할 수 있어요.' };
  }
  if (
    typeof asset.fileSize === 'number' &&
    asset.fileSize > MAX_FEED_IMAGE_SIZE_BYTES
  ) {
    return { error: '이미지는 5MB 이하만 등록할 수 있어요.' };
  }

  return {
    file: {
      uri: asset.uri,
      type: asset.type,
      name:
        asset.fileName?.trim() ||
        `feed-image.${MIME_TYPE_EXTENSIONS[asset.type]}`,
    },
  };
}
