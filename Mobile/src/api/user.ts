import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export interface ProfileImageFile {
  uri: string;

  type: string;
  name: string;
}

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

export async function deleteProfileImage(): Promise<void> {
  await axios.delete(resolveApiUrl('/api/user/profile-image'));
}

export async function changeProfileVisibility(
  profilePublic: boolean,
): Promise<void> {
  await axios.patch(resolveApiUrl('/api/user/profile/visibility'), {
    profilePublic,
  });
}

export interface PublicUserProfile {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  preferredThemes: { preferredThemeId: number; preferredThemeName: string; category: string }[];
  myPlanCount: number;
  editablePlanCount: number;
}

export async function fetchPublicProfile(
  targetUserId: string,
  signal?: AbortSignal,
): Promise<PublicUserProfile> {
  const response = await axios.get<PublicUserProfile>(
    resolveApiUrl(`/api/user/profile/${targetUserId}`),
    { signal },
  );
  return response.data;
}
