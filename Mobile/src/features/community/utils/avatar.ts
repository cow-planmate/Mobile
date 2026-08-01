/**
 * 작성자 프로필 이미지 URL 결정.
 *
 * 프로필 사진 → Gravatar → (호출부에서) 닉네임 이니셜 순으로 떨어진다.
 */

/**
 * 사설망/루프백 주소를 가리키는 URL인지 판별한다.
 *
 * 커뮤니티 서비스의 오브젝트 스토리지 공개 URL 설정이 어긋나면 프로필 사진이
 * `http://192.168.0.90:9000/...` 같은 내부 주소로 내려온다. 브라우저(개발
 * PC)에서는 열리지만 실기기에서는 절대 로드되지 않고, 이미지가 깨진 채로
 * 타임아웃될 때까지 기다리게 된다. 그런 주소는 없는 것으로 취급해 Gravatar로
 * 곧장 떨어뜨린다.
 *
 * 서버 설정이 고쳐지면 이 가드는 자연히 아무 URL도 걸러내지 않는다.
 */
export const isUnreachableHostUrl = (url: string): boolean => {
  const host = url.replace(/^https?:\/\//i, '').split(/[/:?#]/)[0];
  if (!host) return true;

  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return true;
  }
  // 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;

  return false;
};

/** 서버가 계산해준 이메일 해시로 Gravatar URL을 만든다. */
export const gravatarUrlFromHash = (hash: string, size = 80): string =>
  `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;

/**
 * 표시할 프로필 이미지 URL을 고른다. 쓸 수 있는 게 없으면 null을 반환하고,
 * 호출부는 닉네임 이니셜로 대체한다.
 */
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
