import axios from 'axios';

export const verifyNicknameAvailable = async (
  nickname: string,
): Promise<boolean> => {
  const { data } = await axios.post<{ nicknameAvailable: boolean }>(
    '/api/auth/register/nickname/verify',
    { nickname },
  );
  return data.nicknameAvailable;
};

export interface ChangePasswordRequest {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> => {
  await axios.patch('/api/auth/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};
