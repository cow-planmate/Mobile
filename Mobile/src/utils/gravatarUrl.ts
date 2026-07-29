import md5 from 'blueimp-md5';

/**
 * 이메일 주소를 기반으로 Gravatar 아바타 이미지 URL을 생성합니다.
 * @param email 이메일 주소
 * @param size 이미지 크기 (픽셀 기본값: 80)
 * @returns Gravatar 아바타 이미지 URL
 */
export default function gravatarUrl(email: string, size: number = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
}

