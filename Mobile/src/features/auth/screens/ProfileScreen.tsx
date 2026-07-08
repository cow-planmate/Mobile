import React, { useState, useCallback, useEffect } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../../store/useAuthStore';
import { PreferredThemeVO } from '../../../types/env';
import ProfileScreenView from './ProfileScreen.view';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { changePassword } from '../../../api/auth';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    preferredThemes: [] as PreferredThemeVO[],
    socialLogin: false,
  });

  const [isNicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [isAgeModalVisible, setAgeModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(resolveApiUrl('/api/user/profile'));
      const data = response.data;

      let genderStr = '미설정';
      if (data.gender === 0) genderStr = '남자';
      else if (data.gender === 1) genderStr = '여자';

      const themes =
        data.preferredThemes && data.preferredThemes.length > 0
          ? data.preferredThemes
              .map((t: PreferredThemeVO) => t.preferredThemeName)
              .join(', ')
          : '미설정';

      setUser({
        name: data.nickname || '이름 없음',
        email: data.email || '',
        age: data.age ? data.age.toString() : '미설정',
        gender: genderStr,
        preferredThemes: data.preferredThemes || [],
        socialLogin: data.socialLogin || false,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showAlert({
        title: '오류',
        message: '사용자 정보를 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateNickname = async (newNickname: string) => {
    try {
      await axios.patch(resolveApiUrl('/api/user/nickname'), {
        nickname: newNickname,
      });
      setUser(prev => ({ ...prev, name: newNickname }));
      Toast.show({
        type: 'success',
        text1: '닉네임이 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
      setNicknameModalVisible(false);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '닉네임 변경에 실패했습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const handleUpdateAge = async (newAge: string) => {
    try {
      await axios.patch(resolveApiUrl('/api/user/age'), {
        age: parseInt(newAge, 10),
      });
      setUser(prev => ({ ...prev, age: newAge }));
      Toast.show({
        type: 'success',
        text1: '나이가 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
      setAgeModalVisible(false);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '나이 변경에 실패했습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const handleUpdateGender = async (newGender: string) => {
    try {
      const genderInt = newGender === '남자' ? 0 : 1;
      await axios.patch(resolveApiUrl('/api/user/gender'), {
        gender: genderInt,
      });
      setUser(prev => ({
        ...prev,
        gender: newGender,
      }));
      Toast.show({
        type: 'success',
        text1: '성별이 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
      setGenderModalVisible(false);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '성별 변경에 실패했습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const handleUpdateTheme = async () => {
    await fetchUserProfile();
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
      const verifyResponse = await axios.post(
        resolveApiUrl('/api/auth/password/verify'),
        {
          password: current,
        },
      );

      if (!verifyResponse.data.passwordVerified) {
        Toast.show({
          type: 'error',
          text1: '현재 비밀번호가 일치하지 않습니다.',
          position: 'top',
          visibilityTime: 2500,
        });
        return;
      }

      await changePassword(current, newPass, newPass);

      Toast.show({
        type: 'success',
        text1: '비밀번호가 성공적으로 변경되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
      setPasswordModalVisible(false);
    } catch (e: any) {
      console.error('Password Update Error:', e);
      const msg = e.response?.data?.message || '비밀번호 변경에 실패했습니다.';
      Toast.show({
        type: 'error',
        text1: msg,
        position: 'top',
        visibilityTime: 2500,
      });
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
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) {
                showAlert({
                  title: '오류',
                  message: '로그인 정보가 유효하지 않습니다.',
                });
                return;
              }

              const response = await axios.delete(
                resolveApiUrl('/api/user/account'),
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (response.status === 200) {
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
                await logout();
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

  return (
    <ProfileScreenView
      loading={loading}
      user={user}
      isNicknameModalVisible={isNicknameModalVisible}
      setNicknameModalVisible={setNicknameModalVisible}
      isAgeModalVisible={isAgeModalVisible}
      setAgeModalVisible={setAgeModalVisible}
      isGenderModalVisible={isGenderModalVisible}
      setGenderModalVisible={setGenderModalVisible}
      isThemeModalVisible={isThemeModalVisible}
      setThemeModalVisible={setThemeModalVisible}
      isPasswordModalVisible={isPasswordModalVisible}
      setPasswordModalVisible={setPasswordModalVisible}
      handleUpdateNickname={handleUpdateNickname}
      handleUpdateAge={handleUpdateAge}
      handleUpdateGender={handleUpdateGender}
      handleUpdateTheme={handleUpdateTheme}
      handleUpdatePassword={handleUpdatePassword}
      handleResign={handleResign}
      logout={logout}
    />
  );
}
