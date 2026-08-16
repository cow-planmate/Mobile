export const isUnreachableHostUrl = (url: string): boolean => {
  const host = url.replace(/^https?:\/\//i, '').split(/[/:?#]/)[0];
  if (!host) return true;

  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return true;
  }

  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;

  return false;
};

export const gravatarUrlFromHash = (hash: string, size = 80): string =>
  `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;

export const resolveAvatarUrl = (
  imageUrl?: string | null,
  avatarHash?: string | null,
  size = 80,
): string | null => {
  if (imageUrl && !isUnreachableHostUrl(imageUrl)) {
    return imageUrl;
  }
  if (avatarHash) {
    return gravatarUrlFromHash(avatarHash, size);
  }
  return null;
};
