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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../../store/useAuthStore';
import ProfileScreenView from './ProfileScreen.view';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { LOGOUT_CLEARED_KEYS } from '../../../constants/storageKeys';
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
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useUserProfile();
  const { data: communityStats, isLoading: isCommunityStatsLoading } = useMyStats();
  const user = data ?? EMPTY_PROFILE;

  // 닉네임·나이·성별은 뷰가 하나의 편집 모달에서 함께 다룬다.
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isProfileImageUpdating, setIsProfileImageUpdating] = useState(false);

  /** 서버 반영 후 프로필 캐시만 부분 갱신한다(재조회 없이 즉시 화면에 반영). */
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

  // 화면에 돌아왔을 때 캐시가 낡았을 때만 다시 조회한다.
  // 무조건 조회하면 일정 수만큼의 상세 요청(N+1)이 매번 반복된다.
  useFocusEffect(
    useCallback(() => {
      void queryClient.refetchQueries({
        queryKey: USER_PROFILE_QUERY_KEY,
        type: 'active',
        stale: true,
      });
    }, [queryClient]),
  );

  /**
   * 세 항목 모두 실패를 그대로 올린다. 삼키면 편집 모달이 실패한 변경까지
   * 저장된 것으로 안내하고 닫힌다.
   */
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
        // 중복(AUTH_005)인지 형식 문제인지 서버 문구로 구분해 알린다.
        text1: getDisplayErrorMessage(e, '닉네임 변경에 실패했습니다.'),
        position: 'top',
        visibilityTime: 2500,
      });
      throw e;
    }
  };

  /**
   * 생년월일을 그대로 저장한다.
   *
   * 예전에는 나이만 받아 `${올해 - 나이}-01-01`로 되돌려 저장했는데,
   * 그러면 사용자의 실제 월·일이 1월 1일로 덮어써졌다.
   */
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
        text1: '생년월일 변경에 실패했습니다.',
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
        text1: '성별 변경에 실패했습니다.',
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

  /**
   * 비밀번호 변경.
   *
   * PATCH가 현재 비밀번호를 이미 검증하므로(PasswordService.changePassword)
   * /api/auth/password/verify를 먼저 부르지 않는다. 모달이 성공 여부로 닫힘을
   * 판단하도록 실패는 그대로 올린다.
   */
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
    showAlert({
      title: '회원 탈퇴',
      message:
        '정말로 탈퇴하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.',
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
                useAuthStore.getState().setUser(null);
                await AsyncStorage.multiRemove(LOGOUT_CLEARED_KEYS);

                showAlert({
                  title: '탈퇴 완료',
                  message: '회원 탈퇴가 완료되었습니다.',
                  type: 'success',
                  buttons: [
                    {
                      text: '확인',
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

  /**
   * 일정 제목 변경. 성공하면 프로필 캐시의 해당 항목만 갈아끼워
   * N+1 재조회 없이 화면에 즉시 반영한다.
   */
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
        // 뷰가 목록을 미리 바꿔 두므로 실패를 알려야 한다. 삼키면 서버가 거절한
        // 이름이 화면에만 남는다.
        throw e;
      }
    },
    [queryClient],
  );

  /** 프로필 공개 여부 변경. 실패는 뷰가 스위치를 되돌리도록 예외를 그대로 던진다. */
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
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
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
  }, [patchProfile, queryClient]);

  const handleDeleteProfileImage = useCallback(async () => {
    setIsProfileImageUpdating(true);
    try {
      await deleteProfileImage();
      await FastImage.clearMemoryCache();
      patchProfile({ profileImageUrl: '' });
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
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
  }, [patchProfile, queryClient]);

  return (
    <ProfileScreenView
      loading={isLoading}
      // 조회에 실패하면 빈 프로필이 그려진다. 값이 없는 계정과 구분되지 않으므로
      // 실패는 실패로 알리고 다시 시도할 수단을 준다.
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
