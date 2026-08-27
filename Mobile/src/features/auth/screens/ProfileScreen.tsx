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
import { useSubmitLock } from '../../../hooks/useSubmitLock';
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
  const authUser = useAuthStore(state => state.user);

  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isProfileImageUpdating, setIsProfileImageUpdating] = useState(false);
  const {
    isSubmitting: isProfileVisibilityUpdating,
    runExclusive: runProfileVisibilityExclusive,
  } = useSubmitLock();

  const patchProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      queryClient.setQueryData<UserProfile>(USER_PROFILE_QUERY_KEY, prev =>
        prev ? { ...prev, ...patch } : prev,
      );
      // 커뮤니티 게시글에서 본인 프로필 카드를 열 때 이름·사진이 변경 전 상태로
      // 5분간 캐시되어 보이지 않도록, 본인 publicProfile 캐시도 함께 무효화한다.
      if (authUser?.userId) {
        void queryClient.invalidateQueries({
          queryKey: ['publicProfile', authUser.userId],
        });
      }
    },
    [queryClient, authUser?.userId],
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
        text1: '닉네임을 변경했어요.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',

        text1: getDisplayErrorMessage(e, '닉네임을 변경하지 못했어요.'),
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
        text1: '생년월일을 변경했어요.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '생년월일을 변경하지 못했어요.'),
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
        text1: '성별을 변경했어요.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '성별을 변경하지 못했어요.'),
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
      text1: '선호 테마를 변경했어요.',
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
        text1: '비밀번호를 변경했어요.',
        position: 'top',
        visibilityTime: 2500,
      });
      setPasswordModalVisible(false);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '비밀번호를 변경하지 못했어요.'),
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
        ? '정말 탈퇴할까요? 작성한 데이터는 삭제돼요. 다만 같은 소셜 계정으로 다시 로그인하면 계정이 복구돼요.'
        : '정말 탈퇴할까요? 탈퇴하면 모든 데이터가 삭제되고 복구할 수 없어요.',
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
                await finishResign();

                showAlert({
                  title: '탈퇴 완료',
                  message: '회원 탈퇴를 마쳤어요.',
                  type: 'success',

                  buttons: [{ text: '확인' }],
                });
              }
            } catch (error) {
              console.error('Resign Error:', error);
              showAlert({
                title: '오류',
                message: '회원 탈퇴를 처리하지 못했어요.',
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
          text1: '일정 제목을 변경했어요.',
          position: 'top',
          visibilityTime: 2500,
        });
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: '제목을 변경하지 못했어요.',
          position: 'top',
          visibilityTime: 2500,
        });

        throw e;
      }
    },
    [queryClient],
  );

  const handleChangeProfileVisibility = useCallback(
    (profilePublic: boolean) =>
      runProfileVisibilityExclusive(async () => {
        await changeProfileVisibility(profilePublic);
        patchProfile({ profilePublic });
      }),
    [patchProfile, runProfileVisibilityExclusive],
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
        text1: '이미지를 선택하지 못했어요.',
        position: 'top',
      });
      return;
    }

    if (result.didCancel) return;

    if (result.errorCode) {
      Toast.show({
        type: 'error',
        text1: result.errorMessage || '이미지를 선택하지 못했어요.',
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
        text1: '프로필 사진을 변경했어요.',
        position: 'top',
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      Toast.show({
        type: 'error',
        text1: message || '프로필 사진을 변경하지 못했어요.',
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
        text1: '프로필 사진을 삭제했어요.',
        position: 'top',
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      Toast.show({
        type: 'error',
        text1: message || '프로필 사진을 삭제하지 못했어요.',
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
      isProfileVisibilityUpdating={isProfileVisibilityUpdating}
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
