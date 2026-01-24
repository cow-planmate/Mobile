import React, { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../contexts/AuthContext';
import { PreferredThemeVO } from '../../../types/env';
import ProfileScreenView from './ProfileScreen.view';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    preferredTheme: '',
  });

  const [isNicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [isAgeModalVisible, setAgeModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`);
      const data = response.data;

      let genderStr = '미설정';
      if (data.gender === 0) genderStr = '남성';
      else if (data.gender === 1) genderStr = '여성';

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
        preferredTheme: themes,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateNickname = async (newNickname: string) => {
    try {
      await axios.patch(`${API_URL}/api/user/nickname`, {
        nickname: newNickname,
      });
      setUser(prev => ({ ...prev, name: newNickname }));
      Alert.alert('성공', '닉네임이 변경되었습니다.');
      setNicknameModalVisible(false);
    } catch (e) {
      Alert.alert('실패', '닉네임 변경에 실패했습니다.');
    }
  };

  const handleUpdateAge = async (newAge: string) => {
    try {
      await axios.patch(`${API_URL}/api/user/age`, {
        age: parseInt(newAge, 10),
      });
      setUser(prev => ({ ...prev, age: newAge }));
      Alert.alert('성공', '나이가 변경되었습니다.');
      setAgeModalVisible(false);
    } catch (e) {
      Alert.alert('실패', '나이 변경에 실패했습니다.');
    }
  };

  const handleUpdateGender = async (newGender: string) => {
    try {
      const genderInt = newGender === 'male' ? 0 : 1;
      await axios.patch(`${API_URL}/api/user/gender`, { gender: genderInt });
      setUser(prev => ({
        ...prev,
        gender: newGender === 'male' ? '남성' : '여성',
      }));
      Alert.alert('성공', '성별이 변경되었습니다.');
      setGenderModalVisible(false);
    } catch (e) {
      Alert.alert('실패', '성별 변경에 실패했습니다.');
    }
  };

  const handleUpdateTheme = async () => {
    await fetchUserProfile();
    Alert.alert('완료', '선호 테마가 변경되었습니다.');
    setThemeModalVisible(false);
  };

  const handleUpdatePassword = async (current: string, newPass: string) => {
    try {
      const verifyResponse = await axios.post(
        `${API_URL}/api/auth/password/verify`,
        {
          password: current,
        },
      );

      if (!verifyResponse.data.passwordVerified) {
        Alert.alert('오류', '현재 비밀번호가 일치하지 않습니다.');
        return;
      }

      await axios.patch(`${API_URL}/api/auth/password`, {
        password: newPass,
        confirmPassword: newPass,
      });

      Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.');
      setPasswordModalVisible(false);
    } catch (e: any) {
      console.error('Password Update Error:', e);
      const msg = e.response?.data?.message || '비밀번호 변경에 실패했습니다.';
      Alert.alert('실패', msg);
    }
  };

  const handleResign = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) {
                Alert.alert('오류', '로그인 정보가 유효하지 않습니다.');
                return;
              }

              const response = await axios.delete(
                `${API_URL}/api/user/account`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (response.status === 200) {
                Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', [
                  {
                    text: '확인',
                    onPress: async () => {
                      await logout();
                    },
                  },
                ]);
              }
            } catch (error) {
              console.error('Resign Error:', error);
              Alert.alert('오류', '회원 탈퇴 처리 중 오류가 발생했습니다.');
            }
          },
        },
      ],
    );
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
