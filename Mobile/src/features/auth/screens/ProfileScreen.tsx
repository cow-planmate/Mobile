import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../../../contexts/AlertContext';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import axios from 'axios';
import { useAuthStore } from '../../../store/useAuthStore';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import ProfileScreenView from './ProfileScreen.view';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { changePassword } from '../../../api/auth';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import {
  changeProfileVisibility,
  deleteProfileImage,
  uploadProfileImage,
} from '../../../api/user';
import {
  useUserProfile,
  UserProfile,
  USER_PROFILE_QUERY_KEY,
} from '../../../hooks/useUserProfile';
import { useMyStats } from '../../community/hooks/queries';
import { buildProfileImageUploadFile } from '../utils/profileImage';
const EMPTY_PROFILE: UserProfile = {
  name: '',
  email: '',
  profileImageUrl: '',
  profilePublic: false,
  birthdate: '',
  gender: '',
  preferredThemes: [],
  socialLogin: false,
  myPlans: [],
};

export default function ProfileScreen({ route }: any) {
  const { showAlert } = useAlert();
  const { disconnect } = useWebSocket();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useUserProfile();
  const { data: communityStats, isLoading: isCommunityStatsLoading } = useMyStats();
  const user = data ?? EMPTY_PROFILE;

  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isProfileImageUpdating, setIsProfileImageUpdating] = useState(false);

  const patchProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      queryClient.setQueryData<UserProfile>(USER_PROFILE_QUERY_KEY, prev =>
        prev ? { ...prev, ...patch } : prev,
      );
    },
    [queryClient],
  );

  const refetchProfile = useCallback(
    () => queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
    [queryClient],
  );

  useFocusEffect(
    useCallback(() => {
      void queryClient.refetchQueries({
        queryKey: USER_PROFILE_QUERY_KEY,
        type: 'active',
        stale: true,
      });
    }, [queryClient]),
  );

  const handleUpdateNickname = async (newNickname: string) => {
    try {
      await axios.patch(resolveApiUrl('/api/user/nickname'), {
        nickname: newNickname,
      });
      patchProfile({ name: newNickname });
      Toast.show({
        type: 'success',
        text1: '닉네임이 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',

        text1: getDisplayErrorMessage(e, '닉네임 변경에 실패했습니다.'),
        position: 'top',
        visibilityTime: 2500,
      });
      throw e;
    }
  };

  const handleUpdateBirthdate = async (newBirthdate: string) => {
    try {
      await axios.patch(resolveApiUrl('/api/user/birthdate'), {
        birthdate: newBirthdate,
      });
      patchProfile({ birthdate: newBirthdate });
      Toast.show({
        type: 'success',
        text1: '생년월일이 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '생년월일 변경에 실패했습니다.'),
        position: 'top',
        visibilityTime: 2500,
      });
      throw e;
    }
  };

  const handleUpdateGender = async (newGender: string) => {
    try {
      let genderEnum = 'OTHER';
      if (newGender === '남자') genderEnum = 'MALE';
      else if (newGender === '여자') genderEnum = 'FEMALE';

      await axios.patch(resolveApiUrl('/api/user/gender'), {
        gender: genderEnum,
      });
      patchProfile({ gender: newGender });
      Toast.show({
        type: 'success',
        text1: '성별이 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '성별 변경에 실패했습니다.'),
        position: 'top',
        visibilityTime: 2500,
      });
      throw e;
    }
  };

  const handleUpdateTheme = async () => {
    await refetchProfile();
    Toast.show({
      type: 'success',
      text1: '선호 테마가 변경되었습니다.',
      position: 'top',
      visibilityTime: 2500,
    });
    setThemeModalVisible(false);
  };

  const handleUpdatePassword = async (current: string, newPass: string) => {
    try {
      await changePassword(current, newPass, newPass);

      Toast.show({
        type: 'success',
        text1: '비밀번호가 성공적으로 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
      setPasswordModalVisible(false);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '비밀번호 변경에 실패했습니다.'),
        position: 'top',
        visibilityTime: 2500,
      });
      throw e;
    }
  };

  const handleResign = () => {
    const finishResign = async () => {
      const { clearSession } = useAuthStore.getState();
      disconnect();
      await clearSession({ forgetLoginMethod: true });
    };

    showAlert({
      title: '회원 탈퇴',
      message: user.socialLogin
        ? '정말로 탈퇴하시겠습니까? 작성한 데이터는 삭제됩니다. 다만 같은 소셜 계정으로 다시 로그인하면 계정이 복구됩니다.'
        : '정말로 탈퇴하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                resolveApiUrl('/api/user/account'),
              );

              if (response.status >= 200 && response.status < 300) {
                await useAuthStore.getState().revokeRefreshToken();

                showAlert({
                  title: '탈퇴 완료',
                  message: '회원 탈퇴가 완료되었습니다.',
                  type: 'success',

                  buttons: [
                    {
                      text: '확인',
                      onPress: () => {
                        void finishResign();
                      },
                    },
                  ],
                });
              }
            } catch (error) {
              console.error('Resign Error:', error);
              showAlert({
                title: '오류',
                message: '회원 탈퇴 처리 중 오류가 발생했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  const handleRenamePlan = useCallback(
    async (planId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      try {
        await axios.patch(resolveApiUrl(`/api/plan/${planId}/name`), {
          planName: trimmed,
        });
        queryClient.setQueryData<UserProfile>(USER_PROFILE_QUERY_KEY, prev =>
          prev
            ? {
                ...prev,
                myPlans: prev.myPlans.map(p =>
                  p.planId === planId ? { ...p, planName: trimmed } : p,
                ),
              }
            : prev,
        );
        Toast.show({
          type: 'success',
          text1: '일정 제목이 변경되었습니다.',
          position: 'top',
          visibilityTime: 2500,
        });
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: '제목 변경에 실패했습니다.',
          position: 'top',
          visibilityTime: 2500,
        });

        throw e;
      }
    },
    [queryClient],
  );

  const handleChangeProfileVisibility = useCallback(
    async (profilePublic: boolean) => {
      await changeProfileVisibility(profilePublic);
      patchProfile({ profilePublic });
    },
    [patchProfile],
  );

  const handleChangeProfileImage = useCallback(async () => {
    let result: ImagePickerResponse;
    try {
      result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeExtra: false,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: '이미지 선택에 실패했습니다.',
        position: 'top',
      });
      return;
    }

    if (result.didCancel) return;

    if (result.errorCode) {
      Toast.show({
        type: 'error',
        text1: result.errorMessage || '이미지 선택에 실패했습니다.',
        position: 'top',
      });
      return;
    }

    const selected = buildProfileImageUploadFile(result.assets?.[0]);
    if ('error' in selected) {
      Toast.show({ type: 'error', text1: selected.error, position: 'top' });
      return;
    }

    setIsProfileImageUpdating(true);
    try {
      const profileImageUrl = await uploadProfileImage(selected.file);
      await FastImage.clearMemoryCache();
      patchProfile({ profileImageUrl });
      Toast.show({
        type: 'success',
        text1: '프로필 사진이 변경되었습니다.',
        position: 'top',
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      Toast.show({
        type: 'error',
        text1: message || '프로필 사진 변경에 실패했습니다.',
        position: 'top',
      });
    } finally {
      setIsProfileImageUpdating(false);
    }
  }, [patchProfile]);

  const handleDeleteProfileImage = useCallback(async () => {
    setIsProfileImageUpdating(true);
    try {
      await deleteProfileImage();
      await FastImage.clearMemoryCache();
      patchProfile({ profileImageUrl: '' });
      Toast.show({
        type: 'success',
        text1: '프로필 사진이 삭제되었습니다.',
        position: 'top',
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      Toast.show({
        type: 'error',
        text1: message || '프로필 사진 삭제에 실패했습니다.',
        position: 'top',
      });
    } finally {
      setIsProfileImageUpdating(false);
    }
  }, [patchProfile]);

  return (
    <ProfileScreenView
      loading={isLoading}

      loadError={isError}
      onRetryLoad={refetch}
      user={user}
      communityStats={communityStats}
      isCommunityStatsLoading={isCommunityStatsLoading}
      onRenamePlan={handleRenamePlan}
      onChangeProfileVisibility={handleChangeProfileVisibility}
      onChangeProfileImage={handleChangeProfileImage}
      onDeleteProfileImage={handleDeleteProfileImage}
      isProfileImageUpdating={isProfileImageUpdating}
      isThemeModalVisible={isThemeModalVisible}
      setThemeModalVisible={setThemeModalVisible}
      isPasswordModalVisible={isPasswordModalVisible}
      setPasswordModalVisible={setPasswordModalVisible}
      handleUpdateNickname={handleUpdateNickname}
      handleUpdateBirthdate={handleUpdateBirthdate}
      handleUpdateGender={handleUpdateGender}
      handleUpdateTheme={handleUpdateTheme}
      handleUpdatePassword={handleUpdatePassword}
      handleResign={handleResign}
      scrollToItinerary={route?.params?.scrollToItinerary}
    />
  );
}
