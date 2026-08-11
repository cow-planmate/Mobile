export const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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

export interface PickedImageAsset {
  uri?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ProfileImageUploadFile {
  uri: string;
  type: string;
  name: string;
}

export type ProfileImageSelectionResult =
  | { file: ProfileImageUploadFile; error?: never }
  | { file?: never; error: string };

export function buildProfileImageUploadFile(
  asset: PickedImageAsset | undefined,
): ProfileImageSelectionResult {
  if (!asset?.uri) {
    return { error: '이미지 파일을 불러오지 못했습니다.' };
  }

  if (!asset.type || !SUPPORTED_MIME_TYPES.has(asset.type)) {
    return { error: 'JPG, PNG, GIF, WebP 이미지만 등록할 수 있습니다.' };
  }

  if (
    typeof asset.fileSize === 'number' &&
    asset.fileSize > MAX_PROFILE_IMAGE_SIZE_BYTES
  ) {
    return { error: '프로필 이미지는 5MB 이하만 등록할 수 있습니다.' };
  }

  return {
    file: {
      uri: asset.uri,
      type: asset.type,
      name:
        asset.fileName?.trim() ||
        `profile-image.${MIME_TYPE_EXTENSIONS[asset.type]}`,
    },
  };
}
