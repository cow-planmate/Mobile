import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

/**
 * 사용자 프로필 이미지 API.
 *
 * 서버는 프로필 이미지를 직접 보관하며(User.profileImageUrl), 값이 없으면
 * 앱은 Gravatar로 대체한다. 업로드는 multipart/form-data이고 서버 검증 기준은
 * 5MB 이하 · image/jpeg|png|gif|webp 이다(ProfileImageValidator).
 */

/** 업로드할 이미지 파일 정보 (이미지 피커 결과에서 채운다) */
export interface ProfileImageFile {
  uri: string;
  /** 'image/jpeg' 등. 서버가 허용 목록으로 검증한다. */
  type: string;
  name: string;
}

/**
 * 프로필 이미지 업로드.
 * @returns 서버가 확정한 이미지 URL
 */
export async function uploadProfileImage(
  file: ProfileImageFile,
): Promise<string> {
  const form = new FormData();
  form.append('file', file as unknown as Blob);

  const response = await axios.post<{ profileImageUrl: string }>(
    resolveApiUrl('/api/user/profile-image'),
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data.profileImageUrl;
}

/** 프로필 이미지 삭제 (이후 Gravatar로 대체 표시된다) */
export async function deleteProfileImage(): Promise<void> {
  await axios.delete(resolveApiUrl('/api/user/profile-image'));
}

/** 프로필 공개 여부 변경 */
export async function changeProfileVisibility(
  profilePublic: boolean,
): Promise<void> {
  await axios.patch(resolveApiUrl('/api/user/profile/visibility'), {
    profilePublic,
  });
}
