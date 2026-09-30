import md5 from 'blueimp-md5';

export default function gravatarUrl(email: string, size: number = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
}
