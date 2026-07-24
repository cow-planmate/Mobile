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

export default function ProfileScreen({ route }: any) {
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
    myPlans: [] as any[],
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
      if (data.gender === 'MALE') genderStr = '남자';
      else if (data.gender === 'FEMALE') genderStr = '여자';
      else if (data.gender === 'OTHER') genderStr = '기타';

      const myPlansRaw = (data.myPlans || []).map((p: any) => ({ ...p, isShared: false }));
      const editablePlansRaw = (data.editablePlans || []).map((p: any) => ({ ...p, isShared: true }));
      const allPlansRaw = [...myPlansRaw, ...editablePlansRaw];

      const plansWithDates = await Promise.all(
        allPlansRaw.map(async (plan: any) => {
          try {
            const planDetailRes = await axios.get(resolveApiUrl(`/api/plan/${plan.planId}`));
            const { timetables } = planDetailRes.data;
            if (timetables && timetables.length > 0) {
              const sorted = [...timetables].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              const formatDateStr = (dateStr: string) => {
                const d = new Date(dateStr);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}.${mm}.${dd}`;
              };
              return {
                ...plan,
                startDate: formatDateStr(sorted[0].date),
                endDate: formatDateStr(sorted[sorted.length - 1].date),
              };
            }
          } catch (e) {
            console.log(`Failed to fetch dates for plan ${plan.planId}:`, e);
          }
          return plan;
        })
      );

      setUser({
        name: data.nickname || '이름 없음',
        email: data.email || '',
        age: data.birthdate
          ? (new Date().getFullYear() - new Date(data.birthdate).getFullYear()).toString()
          : '미설정',
        gender: genderStr,
        preferredThemes: data.preferredThemes || [],
        socialLogin: data.isSocialLogin || false,
        myPlans: plansWithDates,
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
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(newAge, 10);
      const birthdate = `${birthYear}-01-01`;

      await axios.patch(resolveApiUrl('/api/user/birthdate'), {
        birthdate,
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
      let genderEnum = 'OTHER';
      if (newGender === '남자') genderEnum = 'MALE';
      else if (newGender === '여자') genderEnum = 'FEMALE';

      await axios.patch(resolveApiUrl('/api/user/gender'), {
        gender: genderEnum,
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
      await axios.post(
        resolveApiUrl('/api/auth/password/verify'),
        {
          password: current,
        },
      );

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

              if (response.status >= 200 && response.status < 300) {
                useAuthStore.getState().setUser(null);
                delete axios.defaults.headers.common.Authorization;
                await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);

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
      scrollToItinerary={route?.params?.scrollToItinerary}
    />
  );
}
