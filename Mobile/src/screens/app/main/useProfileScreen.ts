import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { useAuth } from '../../../contexts/AuthContext';

interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
}

export const useProfileScreen = () => {
  const { logout } = useAuth();

  const [isAgeModalVisible, setAgeModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    preferredTheme: '',
  });

  const fetchUserProfile = async () => {
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
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, []),
  );

  const handleUpdateAge = async (newAge: string) => {
    try {
      await axios.patch(`${API_URL}/api/user/age`, {
        age: parseInt(newAge, 10),
      });
      setUser(prev => ({ ...prev, age: newAge }));
      Alert.alert('성공', '나이가 변경되었습니다.');
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
    } catch (e) {
      Alert.alert('실패', '성별 변경에 실패했습니다.');
    }
  };

  const handleUpdateTheme = async () => {
    fetchUserProfile();
    Alert.alert('완료', '선호 테마가 변경되었습니다.');
  };

  const handleUpdatePassword = () => {
    Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.');
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
            } catch (error: any) {
              console.error('Resign Error:', error);
              const msg =
                error.response?.data?.message || '탈퇴 처리에 실패했습니다.';
              Alert.alert('오류', msg);
            }
          },
        },
      ],
    );
  };

  return {
    isAgeModalVisible,
    isGenderModalVisible,
    isThemeModalVisible,
    isPasswordModalVisible,
    loading,
    user,
    logout,
    setAgeModalVisible,
    setGenderModalVisible,
    setThemeModalVisible,
    setPasswordModalVisible,
    handleUpdateAge,
    handleUpdateGender,
    handleUpdateTheme,
    handleUpdatePassword,
    handleResign,
  };
};
